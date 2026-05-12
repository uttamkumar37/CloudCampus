/**
 * profileStore — wraps react-native-mmkv (encrypted).
 *
 * Caches the AuthUser profile so the app can restore UI immediately
 * on next launch while the async SecureStore refresh completes.
 *
 * MMKV is synchronous and significantly faster than AsyncStorage.
 */
import { createMMKV } from 'react-native-mmkv';
import type { AuthUser } from '@/features/auth/types/auth';

const storage = createMMKV({ id: 'cc-profile', encryptionKey: 'cc-profile-key' });

const PROFILE_KEY = 'user_profile';

export const profileStore = {
  saveProfile(user: AuthUser): void {
    storage.set(PROFILE_KEY, JSON.stringify(user));
  },

  getProfile(): AuthUser | null {
    const raw = storage.getString(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  deleteProfile(): void {
    storage.remove(PROFILE_KEY);
  },
};
