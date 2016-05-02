var fs = require('fs');
var crypto = require('crypto');

/*
read_database takes a path and a password and will return the contents of the decrypted contents of the database. 

at the moment, read_database 

*/

function read_database (path, password){
    fs.readFile(path, function(err, buffer){
        var masterKey = generateMasterKey(password, buffer);
        var iv = buffer.slice(8,24);

        console.log(masterKey, 'iv', iv)
        if (validateMasterKey(masterKey, buffer, iv)){
            var dbBody = buffer.slice(88)
            return decryptDB(iv, masterKey, dbBody);
        } else {
            console.log("Invalid password")
        }
    })

}

function write_database (path, password, contents){

    if (fs.existsSync(path) && typeof contents === 'object' && !Array.isArray(contents)){
        var salt = new Buffer('wY10$'+password, 'utf8');
        var masterKey = digest(salt);
        var iv = crypto.randomBytes(16);

        var headBuffer = headToBuffer(salt, masterKey, iv);

        var keyValBuffers = [];
        for (var key in contents){
           //how do i pass in the iv and the masterkey to this fn? the last step
            keyValBuffers.push(keyValToBuffer(key.length, key, contents[key].length, contents[key], masterKey, iv));
        }

        keyValBuffers = Buffer.concat(keyValBuffers);

        fs.writeFile(path, Buffer.concat([headBuffer, keyValBuffers]), 'utf8',function(){
            console.log('Write to database complete');
        })
        
    }
    else {
        console.log("Contents should be an object and path should exist")
    }
       
}


/********************HELPER FUNCTIONS (READ)*******************/

function generateMasterKey(password, buffer){
    var salt = buffer.slice(4,8).toString('utf8');
    // console.log('lalalla',salt + '$' + password)
    return digest(salt + '$' + password);
}

function digest (input){
    return crypto.createHash('md5').update(input).digest();
}

function validateMasterKey(masterKey, buffer, iv){
    var validationBlock = buffer.slice(24,24+64); 
    return checkValidationBlock(iv, validationBlock, masterKey);
}

function checkValidationBlock (iv, validationBlock, masterKey){
    var decryptedBuffer = aesDecipher(iv, validationBlock, masterKey);
    // console.log('decryptedBuffer',decryptedBuffer.length, decryptedBuffer, decryptedBuffer.toString('utf-8'));
    // console.log( 'first32',decryptedBuffer.slice(0,32));
    var first32digested = digest(decryptedBuffer.slice(0,32));
    var digestValidation = decryptedBuffer.slice(32,32+16);
    // console.log( 'first32digested', first32digested);
    // console.log( 'digestValidation', digestValidation);
    // console.log(first32digested.equals(digestValidation));
    return first32digested.equals(digestValidation);
}

function aesCipher(iv, value, masterKey){
    var cipher = crypto.createCipher('aes-128-cbc', masterKey, iv);
    var crypted = cipher.update(value);
    crypted = Buffer.concat([crypted, cipher.final()]);   
    return crypted;
}

function aesDecipher(iv, encryptedBuffer, masterKey){
    // console.log('iv', iv.length, iv); //iv is 16
    // console.log('encryptedBuffer', encryptedBuffer.length, encryptedBuffer)
    var decipher = crypto.createDecipheriv('aes-128-cbc', masterKey, iv);
    decipher.setAutoPadding(false); //IMPORTANT
    var decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([ decrypted, decipher.final()]);
    return decrypted;
}

function decryptDB(iv, masterKey, dbBody){
    var dictionary = {};
    var bookmark = 0;
    var keyLength, key, valueLength, value, padding, md5digestVal, unpaddedVal;
    var decryptedValue;

    while (bookmark < dbBody.length){
        console.log('bookmark', bookmark)
        keyLength = dbBody.slice(bookmark, bookmark+4).readUInt32BE();
        bookmark += 4;
        
        key = dbBody.slice(bookmark, bookmark+keyLength).toString('utf8');
        bookmark += keyLength;

        valueLength = dbBody.slice(bookmark, bookmark+4).readUInt32BE();
        bookmark += 4;
        padding = 16-(valueLength%16);

        console.log('before value', keyLength, key, valueLength);
        console.log('padding', padding)

        // value = dbBody.slice(bookmark, bookmark+valueLength);
        value = dbBody.slice(bookmark, bookmark+valueLength+padding);
        console.log('val', value)

        decryptedValue = aesDecipher(iv, value, masterKey);

        // unpaddedVal = value.slice(0, valueLength);
        // console.log('unpaddedVal', unpaddedVal.toString('utf8'))
        // md5digestVal = value.slice(bookmark, bookmark+16);

        dictionary[key] = decryptedValue.toString('utf8');
        bookmark+= valueLength + padding;

        // console.log('md5digestVal', md5digestVal);
        // bookmark+= 16;

    }


    console.log(dictionary);
    return dictionary;
}

/********************HELPER FUNCTIONS (WRITE)*******************/

function headToBuffer(salt, masterKey, iv){
    var magic = new Buffer('BADCAB00', 'hex');    
    var s = randomString(32);
    var encryptedS = aesCipher(iv, s, masterKey);
    // console.log('encryptedS', encryptedS);
    var md5S = digest(s);
    var zeros = new Buffer(4);
    return Buffer.concat([magic, salt, iv, encryptedS, md5S, zeros]);
}


function keyValToBuffer(keyLength, key, valueLength, value, masterKey, iv){
    // console.log(arguments);
    //add padding, add null character
    var keyLengthBuff = new Buffer(4);
    keyLengthBuff.writeInt32BE(keyLength);

    var keyBuff = new Buffer(key);

    var valueLengthBuff = new Buffer(4);
    valueLengthBuff.writeInt32BE(valueLength);

    var valueBuff = valueBuffnPad(key);
    // console.log('iv',iv)
    var encryptedValueBuffer = aesCipher(iv,valueBuff,masterKey);
    // console.log('valBuff', valueBuff, 'encryptedBuffer',encryptedValueBuffer );

    var buffToAddToDB = Buffer.concat([keyLengthBuff, keyBuff, nullByte(), valueLengthBuff,encryptedValueBuffer]);
    // console.log('before',buffToAddToDB.toString('utf8'));

    return buffToAddToDB;

}

function nullByte(){
    var nullBuff = new Buffer(1);
    nullBuff.writeInt8(0);
    return nullBuff;
}

function valueBuffnPad(string){
    var valBuff = new Buffer(string, 'utf8');
    var padLen = 16- (valBuff.length % 16);
    

    var padBuff = new Buffer(padLen);
    for (var i = 0; i < padLen; i++) {
      padBuff.writeInt8(padLen, i);
    }

    // console.log('buffnpad',Buffer.concat([valBuff, padBuff]));
    return Buffer.concat([valBuff, padBuff]);
    //expect 'abcd' to have 12 bytes of 12
}

function randomString (howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}


write_database('./newdemo.db', 'uberpass', {'abc':'abc','pass': 'word', 'key': 'value'});
read_database('demo.db', 'uberpass');
