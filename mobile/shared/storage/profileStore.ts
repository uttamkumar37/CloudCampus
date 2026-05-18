/**
 * profileStore — wraps react-native-mmkv (encrypted).
 *
 * Caches the AuthUser profile so the app can restore UI immediately
 * on next launch while the async SecureStore refresh completes.
 *
 * M-06: MMKV encryption key is derived from expo-secure-store rather than
 * being hardcoded in the JS bundle. On first launch a random 32-byte key
 * is generated and stored in the secure enclave (Keystore/SecureEnclave);
 * subsequent launches reuse that key. The JS bundle therefore never contains
 * the actual encryption secret.
 *
 * MMKV is synchronous and significantly faster than AsyncStorage.
 */
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';
import type { AuthUser } from '@/features/auth/types/auth';

const SECURE_STORE_KEY = 'cc_profile_mmkv_key';
const PROFILE_KEY      = 'user_profile';

let _storage: MMKV | null = null;

/** Returns the singleton MMKV instance, creating it on first call. */
async function getStorage(): Promise<MMKV> {
  if (_storage) return _storage;

  let encryptionKey = await SecureStore.getItemAsync(SECURE_STORE_KEY);
  if (!encryptionKey) {
    // Generate a random 32-byte key encoded as hex (64 chars)
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    encryptionKey = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    await SecureStore.setItemAsync(SECURE_STORE_KEY, encryptionKey, {
      requireAuthentication: false,
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  }

  _storage = new MMKV({ id: 'cc-profile', encryptionKey });
  return _storage;
}

export const profileStore = {
  async saveProfile(user: AuthUser): Promise<void> {
    const s = await getStorage();
    s.set(PROFILE_KEY, JSON.stringify(user));
  },

  async getProfile(): Promise<AuthUser | null> {
    const s   = await getStorage();
    const raw = s.getString(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async deleteProfile(): Promise<void> {
    const s = await getStorage();
    s.delete(PROFILE_KEY);
  },
};
