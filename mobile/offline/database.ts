/**
 * database — singleton WatermelonDB instance.
 *
 * L-07: Encryption is enforced via a per-install 256-bit AES key stored in
 * the iOS Keychain / Android Keystore through expo-secure-store.  The key is
 * generated once on first launch and then reused for every subsequent open.
 *
 * IMPORTANT — native SQLCipher required:
 *   Actual at-rest encryption requires the SQLCipher-backed WatermelonDB
 *   native build (replace the default SQLite pod / AAR with SQLCipher).
 *   The key infrastructure here is ready; enable encryption at the native
 *   build level by following the WatermelonDB SQLCipher integration guide.
 */
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import * as SecureStore from 'expo-secure-store';
import { schema } from './schema/schema';
import { AttendanceRecord } from './models/AttendanceRecord';
import { Student } from './models/Student';

const DB_ENCRYPTION_KEY_STORE = 'wdb_enc_key_v1';

async function getOrCreateEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(DB_ENCRYPTION_KEY_STORE);
  if (!key) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    key = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    await SecureStore.setItemAsync(DB_ENCRYPTION_KEY_STORE, key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
  return key;
}

function buildDatabase(encryptionKey?: string): Database {
  const adapter = new SQLiteAdapter({
    schema,
    jsi: true,
    // encryptionKey is passed through to the native SQLCipher layer when the
    // SQLCipher-backed build is active.  No-op on the default SQLite build.
    ...(encryptionKey ? { encryptionKey } : {}),
    onSetUpError: (error) => {
      console.error('[WatermelonDB] Setup error:', error);
    },
  });
  return new Database({ adapter, modelClasses: [AttendanceRecord, Student] });
}

// Eager singleton — initialised without the encryption key on first import so
// that synchronous consumers keep working.  Call initDatabase() in the root
// layout before any WatermelonDB queries to replace this with the encrypted
// instance.
let _database: Database = buildDatabase();

export async function initDatabase(): Promise<void> {
  const key = await getOrCreateEncryptionKey();
  _database = buildDatabase(key);
}

// Proxy accessor — always returns the current (potentially encrypted) instance.
export const database: Database = new Proxy({} as Database, {
  get(_target, prop) {
    return (_database as unknown as Record<string | symbol, unknown>)[prop];
  },
});
