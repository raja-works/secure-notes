import { encryptData, decryptData } from './crypto';

export const exportBackup = (state) => {
    if (!state.globalPin) {
        alert("App must be unlocked with PIN to export encrypted backup.");
        return;
    }

    // Encrypt the entire notes array
    const dataStr = JSON.stringify(state.notes);
    const encrypted = encryptData(dataStr, state.globalPin);

    if (!encrypted) {
        alert("Encryption failed.");
        return;
    }

    const blob = new Blob([encrypted], { type: "application/text" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `secure_notes_backup_${new Date().toISOString()}.enc`; // changed extension to .enc
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const importBackup = (file, pin, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            // Attempt decrypt
            const decrypted = decryptData(content, pin);
            if (!decrypted) {
                alert("Decryption failed. Invalid PIN or corrupt file.");
                return;
            }

            const parsed = JSON.parse(decrypted);
            if (Array.isArray(parsed)) {
                callback(parsed);
            } else {
                alert("Invalid backup format after decryption.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to process backup file. Check if PIN is correct.");
        }
    };
    reader.readAsText(file);
};


