import CryptoJS from 'crypto-js';

// In a real app, this should be derivied from a user password via PBKDF2
// For this demo, we'll store a "salt" in local storage or generate one
// But since requirements say "locking", we assume the PIN/Password acts as the key
// CAUTION: If user forgets PIN, data is lost.

export const encryptData = (data, pswd) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), pswd).toString();
    } catch (e) {
        console.error("Encryption Failed", e);
        return null;
    }
};

export const decryptData = (ciphertext, pswd) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, pswd);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        // console.error("Decryption Failed", e);
        return null;
    }
};

export const hashPin = (pin) => {
    return CryptoJS.SHA256(pin).toString();
};
