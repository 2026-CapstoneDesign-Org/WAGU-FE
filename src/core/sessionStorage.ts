import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider } from '../api/wagu';

const SESSION_STORAGE_KEY = 'wagu.auth.session';

export type StoredSession = {
  accessToken: string;
  provider: AuthProvider;
  refreshToken: string | null;
};

export async function readStoredSession() {
  const rawValue = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredSession>;

    if (
      typeof parsed.accessToken !== 'string' ||
      (parsed.refreshToken !== null && parsed.refreshToken !== undefined && typeof parsed.refreshToken !== 'string') ||
      (parsed.provider !== 'google' && parsed.provider !== 'kakao' && parsed.provider !== 'naver')
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      provider: parsed.provider,
      refreshToken: parsed.refreshToken ?? null,
    } satisfies StoredSession;
  } catch {
    return null;
  }
}

export async function writeStoredSession(session: StoredSession) {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredSession() {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}
