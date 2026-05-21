// Token storage abstraction.
//
// On iOS / Android: expo-secure-store (Keychain / EncryptedSharedPreferences).
// On web: localStorage (SecureStore not available; web is dev/preview only).
//
// The native fallback is dynamically required so the web bundle never touches
// the SecureStore native module.

import { Platform } from 'react-native';

const STORAGE_KEY = 'cloudcampus.mobile.session';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;            // epoch ms when access token expires
  tenantHeader: string | null;
  user: {
    userId: string;
    role: string;
    tenantId: string | null;
    schoolId: string | null;
    requiresPasswordChange?: boolean;
    features?: string[];
  };
}

async function read(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  }
  // Dynamic import so Metro doesn't try to bundle the native module on web.
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(STORAGE_KEY);
}

async function write(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, value);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

async function remove(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

export async function loadSession(): Promise<StoredSession | null> {
  const raw = await read();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    await remove();
    return null;
  }
}

export async function saveSession(s: StoredSession): Promise<void> {
  await write(JSON.stringify(s));
}

export async function clearSession(): Promise<void> {
  await remove();
}
