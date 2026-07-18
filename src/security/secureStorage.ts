import * as SecureStore from 'expo-secure-store';

/**
 * Hardware-backed secure storage wrapper (spec 13.1).
 *
 * On iOS this uses the Keychain; on Android the Keystore/EncryptedSharedPrefs.
 * Use ONLY this module for tokens, session state, and any small PHI that must
 * persist on-device. Do NOT put PHI or credentials in AsyncStorage (which is
 * unencrypted).
 *
 * `requireAuthentication` can be enabled for the most sensitive keys so the OS
 * gates access behind device biometrics/passcode.
 */

export const SecureKeys = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  sessionUser: 'auth.sessionUser',
  biometricEnabled: 'auth.biometricEnabled',
} as const;

export type SecureKey = (typeof SecureKeys)[keyof typeof SecureKeys];

const baseOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function setSecureItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value, baseOptions);
}

export async function getSecureItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key, baseOptions);
}

export async function deleteSecureItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key, baseOptions);
}

export async function setSecureJSON<T>(key: string, value: T): Promise<void> {
  await setSecureItem(key, JSON.stringify(value));
}

export async function getSecureJSON<T>(key: string): Promise<T | null> {
  const raw = await getSecureItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Wipe all app-managed secrets. Called on logout and on security events. */
export async function clearAllSecureItems(): Promise<void> {
  await Promise.all(Object.values(SecureKeys).map((k) => deleteSecureItem(k)));
}
