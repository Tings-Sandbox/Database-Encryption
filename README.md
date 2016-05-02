#Database Encryption/ Decryption 

###Prompt
Given an encrypted database, return the decrypted key-value pairs. 
  values are encrypted with MASTER KEY. 
  master key is the MD5 digest of (wy10$uberpass), so (wy10$uberpass) needs to be put into MD5 to return the master key
  note that the AES encrypted strings may have padding that varies depending on its length. remove those padding. 
Read [problem_statement.markdown] and [spec.markdown] for more detailed description.

###Run Solution
```
npm install
node index.js
```
Read [Uber Challenge.docx] for information on how I approached the problem!

###Terminology
MD5 - The most widely used hashing system. It's 128-bit and produces a 32-character message digest.

AES Algorithm encrypts data using a key and an optional iv. 
AES, as a block cipher, does not change the size. The input size is always the output size.
But AES, being a block cipher, requires the input to be multiple of block size (16 bytes). For this, padding schemes are used like the popular PKCS5. So the answer is that the size of your encrypted data depends on the padding scheme used. But at the same time all known padding schemes will round up to the next module 16 size (size AES has a 16 bytes block size).


### Using AES-256-CTR in Encrypting and Decrypting 

```
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(buffer){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  return crypted;
}
 
function decrypt(buffer){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
  return dec;
}
 
var hw = encrypt(new Buffer("hello world", "utf8"))
console.log(hw);
// outputs hello world
console.log(decrypt(hw).toString('utf8'));
```

Source: https://github.com/chris-rock/node-crypto-examples

### Using fs to Copy Files 

```
var fs = require('fs');

function copyData(savPath, srcPath) {
    fs.readFile(srcPath, 'utf8', function (err, data) {
            if (err) throw err;
            //Do your processing, MD5, send a satellite to the moon, etc.
            fs.writeFile (savPath, data, function(err) {
                if (err) throw err;
                console.log('complete');
            });
        });
}

copyData('save.txt', 'read.txt');
```

### Buffer.slice() to copy a portion of a buffer 

buffer.slice(start, end=buffer.length)

This method's API is generally the same as that of Array.prototype.slice, but with one very import difference: The slice is not a new buffer and merely references a subset of the memory space. Modifying the slice will also modify the original buffer! For example:

```
> var puddle = frosty.slice(16, 19)
> puddle.toString()
'☃'
> puddle.write("___")
3
> frosty.toString("utf-8", 0, 19)
'Happy birthday! ___'
```



###Resources:

http://lollyrock.com/articles/nodejs-encryption/
contains examples on how to encrypt and decrypt streams, text, etc using the crypto module. 

http://joeywhelan.blogspot.com/2014/02/nodejs-crypto-module-examples.html

https://docs.nodejitsu.com/articles/cryptography/how-to-use-crypto-module
Has good code examples on how to use aes-128 in the crypto module 

https://nodejs.org/api/crypto.html#crypto_crypto_createdecipheriv_algorithm_key_iv
Original node crypto documentation

https://www.npmjs.com/package/crypto-js
Cryto-js module docs

http://codebeautify.org/hex-string-converter
Hex to string

https://docs.nodejitsu.com/articles/advanced/buffers/how-to-use-buffers

http://stackoverflow.com/questions/5784621/how-to-read-binary-files-byte-by-byte-in-node-js