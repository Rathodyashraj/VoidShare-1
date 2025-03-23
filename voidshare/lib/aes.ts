import * as crypto from 'crypto';

export class AES256 {
  private key!: CryptoKey;

  constructor(key: Uint8Array) {
    this.importKey(key);
  }

  private async importKey(rawKey: Uint8Array) {
    this.key = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async encryptFile(file: File): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const fileData = new Uint8Array(await file.arrayBuffer());
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      this.key, // Now, this.key is already a CryptoKey
      fileData
    );

    return new Uint8Array([...iv, ...new Uint8Array(encryptedData)]);
  }

  async decryptFile(encryptedData: Uint8Array): Promise<File> {
    const iv = encryptedData.slice(0, 16);
    const data = encryptedData.slice(16);

    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      this.key,
      data
    );

    const fileBlob = new Blob([new Uint8Array(decryptedData)]);
    return new File([fileBlob], "decrypted_file");
  }
}