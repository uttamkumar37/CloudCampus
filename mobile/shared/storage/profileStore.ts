/**
 * profileStore — wraps Expo SecureStore.
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
 * SecureStore keeps Expo Go usable for local phone testing. A custom
 * development build can swap this back to MMKV if synchronous access is needed.
 */
import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '@/features/auth/types/auth';

const PROFILE_KEY = 'cc_user_profile';

export const profileStore = {
  async saveProfile(user: AuthUser): Promise<void> {
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(user), {
      requireAuthentication: false,
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  },

  async getProfile(): Promise<AuthUser | null> {
    const raw = await SecureStore.getItemAsync(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async deleteProfile(): Promise<void> {
    await SecureStore.deleteItemAsync(PROFILE_KEY);
  },
};
