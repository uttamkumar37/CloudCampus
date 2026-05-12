/**
 * tokenStore — wraps Expo SecureStore.
 *
 * Refresh token is the only value persisted across app restarts.
 * Access token stays in memory (Zustand) — never written here.
 *
 * SecureStore uses:
 *   iOS  → Keychain (hardware-backed on devices with Secure Enclave)
 *   Android → EncryptedSharedPreferences / Keystore
 */
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'cc_refresh_token';

export const tokenStore = {
  async saveRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async deleteRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
