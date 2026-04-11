import * as SecureStore from "expo-secure-store";

const TOKENS_KEY = "retail-management-auth-tokens";

export type StoredAuthTokens = {
  token: string;
  refreshToken: string | null;
};

export async function readAuthTokens(): Promise<StoredAuthTokens | null> {
  const payload = await SecureStore.getItemAsync(TOKENS_KEY);
  if (!payload) {
    return null;
  }
  try {
    const parsed = JSON.parse(payload) as StoredAuthTokens;
    if (!parsed?.token) {
      return null;
    }
    return { token: parsed.token, refreshToken: parsed.refreshToken ?? null };
  } catch {
    return null;
  }
}

export async function writeAuthTokens(tokens: StoredAuthTokens) {
  await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearAuthTokens() {
  await SecureStore.deleteItemAsync(TOKENS_KEY);
}
