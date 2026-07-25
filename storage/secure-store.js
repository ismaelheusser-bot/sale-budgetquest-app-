const DB_NAME = 'budgetquest-secure';
const DB_VERSION = 1;
const STORE_NAME = 'vault';
const DEFAULT_ITERATIONS = 310000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Lokaler Datenspeicher konnte nicht geöffnet werden.'));
  });
}

async function deriveKey(passphrase, salt, iterations = DEFAULT_ITERATIONS) {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('Das Datenschutz-Passwort muss mindestens 8 Zeichen lang sein.');
  }

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function writeRecord(record) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('Lokale Speicherung fehlgeschlagen.'));
    };
  });
}

async function readRecord(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Lokale Daten konnten nicht gelesen werden.'));
    transaction.oncomplete = () => db.close();
  });
}

async function deleteRecord(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(key);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('Lokale Daten konnten nicht gelöscht werden.'));
    };
  });
}

export const SecureStore = Object.freeze({
  async save(key, value, passphrase) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cryptoKey = await deriveKey(passphrase, salt);
    const plaintext = encoder.encode(JSON.stringify(value));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plaintext);

    await writeRecord({
      key,
      version: 1,
      algorithm: 'AES-GCM-256',
      keyDerivation: 'PBKDF2-SHA-256',
      iterations: DEFAULT_ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(encrypted)),
      updatedAt: new Date().toISOString()
    });
  },

  async load(key, passphrase) {
    const record = await readRecord(key);
    if (!record) return null;

    try {
      const salt = base64ToBytes(record.salt);
      const iv = base64ToBytes(record.iv);
      const ciphertext = base64ToBytes(record.ciphertext);
      const cryptoKey = await deriveKey(passphrase, salt, record.iterations);
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
      return JSON.parse(decoder.decode(plaintext));
    } catch {
      throw new Error('Passwort falsch oder lokaler Datensatz beschädigt.');
    }
  },

  async remove(key) {
    await deleteRecord(key);
  },

  async exists(key) {
    return Boolean(await readRecord(key));
  }
});
