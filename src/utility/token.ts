import { storage } from './localStorage';

export const ACCESS_TOKEN_KEY = 'bazeni.accessToken';

export const getAccessToken = (): string | null => {
  const v = storage.getItem(ACCESS_TOKEN_KEY);
  return typeof v === 'string' ? v : (v as string | null);
};

export const setAccessToken = (token: string | null) => {
  if (!token) {
    storage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    storage.setItem(ACCESS_TOKEN_KEY, token);
  }
};
