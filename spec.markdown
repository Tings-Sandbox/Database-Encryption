## Definitions

* Words shall be persisted in Network Order, for ever and ever, amen
* AES-128 refers to the Advanced Encryption Standard (a.k.a. Rijndael) with a block size of 128 bits (ISO 18033-3), operating in CBC mode
* Unless otherwise noted, all string datatypes should be considered to be UTF-8 data followed by a terminating NUL byte
* MD5 refers to the message digest algorithm specified in [RFC1321](http://tools.ietf.org/html/rfc1321).
* JSON refers to JavaScript Object Notation as specified in [RFC4627](http://tools.ietf.org/html/rfc4627). Note that all string files in JSON should be considered to be UTF-8 encoded unicode data.
* An alphanumeric character is defined in the standard manner as an ASCII character in the ranges [0x30:0x39], [0x41:0x5A], or [0x61:0x7A].

## Key Derivation

All values will be stored encrypted with a master key. That key is the MD5 digest of a salted user-generated password. The salted input to the message digest function shall consist of four alphanumeric characters, followed by the character '$', and shall be prefixed to the input password.

## Padding

Some strings encrypted with AES shall be padded out to a multiple of the cipher block length using the PKCS#7 padding algorithm, as specified in [RFC5652](http://tools.ietf.org/html/rfc5652#section-6.3).

 * Let `l` be the length of the unpadded string
 * Let `m` be the amount of padding (`16 - (l % 16)`).
 * Append `m` bytes of the digit ` m` to the end of the input string.

Example:

 * A 30-byte string consisting entirely of zero bytes shall be padded out to 32 bytes by appending two bytes of `0x02`
 * A 32-byte string consisting entirely of zero bytes shall be padded out to 48 bytes by appending 16 bytes of `0x10`

## File format

* The first four bytes of the file shall be the magic number 0xBADCAB00
* The next four bytes of the file shall contain the four salt characters used when creating the file
* The next sixteen bytes of the file shall be a series of cryptographically-random bytes used as the IV for AES-128
* The next sixty-four bytes of the file, when decrypted using AES 128 with the IV loaded, shall yield a thirty-two-byte random string, the MD5 digest of that thirty-two byte random string, and sixteen zeros. This is provided for easy password checking without decrypting the whole file.
* The remainder of the file shall consist of key-value pairs of the following form:
    * A 32-bit word of the length of the key (including trailing NUL byte)
    * The key
    * A 32-bit word of the length of the encrypted value
    * The encrypted value (serialized as JSON and padded as described above)
    * A 16-byte MD5 of the decrypted, unpadded value
