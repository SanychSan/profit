const enc = new TextEncoder();
const dec = new TextDecoder();

// encryption
export const encryptString = async (text: string) => {
  // 1. Generate a random AES key
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt'
  ]);

  // 2. Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 3. Encrypt the text
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text))
  );

  // 4. Export the key in base64 for storage
  const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', key));

  return {
    ciphertext: btoa(String.fromCharCode(...ciphertext)),
    iv: btoa(String.fromCharCode(...iv)),
    key: btoa(String.fromCharCode(...rawKey))
  };
};

// decryption
export const decryptString = async (
  ciphertextB64: string,
  ivB64: string,
  keyB64: string
): Promise<string> => {
  if (!ciphertextB64 || !ivB64 || !keyB64) {
    return '';
  }

  const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const rawKey = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt'
  ]);

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

  return dec.decode(plaintext);
};
