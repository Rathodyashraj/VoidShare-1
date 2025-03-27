import * as crypto from 'crypto';

export class AES256 {
  constructor(key) {
    this.importKey(key);
  }

  importKey(rawKey) {
    return crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"]
    ).then(key => {
      this.key = key;
    });
  }

  encryptFile(file) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const mimeType = file.type; // Get the MIME type of the file

    return file.arrayBuffer().then(buffer => {
      const fileData = new Uint8Array(buffer);
      return crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        this.key,
        fileData
      ).then(encryptedData => {
        // Prepend the MIME type length and MIME type to the encrypted data
        const mimeTypeBytes = new TextEncoder().encode(mimeType);
        const mimeTypeLength = new Uint8Array([mimeTypeBytes.length]);

        return new Uint8Array([
          ...mimeTypeLength,
          ...mimeTypeBytes,
          ...iv,
          ...new Uint8Array(encryptedData),
        ]);
      });
    });
  }

  decryptFile(encryptedData) {
    // Extract the MIME type length and MIME type
    const mimeTypeLength = encryptedData[0];
    const mimeTypeBytes = encryptedData.slice(1, 1 + mimeTypeLength);
    const mimeType = new TextDecoder().decode(mimeTypeBytes);

    const iv = encryptedData.slice(1 + mimeTypeLength, 17 + mimeTypeLength);
    const data = encryptedData.slice(17 + mimeTypeLength);

    return crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      this.key,
      data
    ).then(decryptedData => {
      const fileBlob = new Blob([new Uint8Array(decryptedData)], { type: mimeType });
      return new File([fileBlob], "decrypted_file", { type: mimeType });
    });
  }
}
