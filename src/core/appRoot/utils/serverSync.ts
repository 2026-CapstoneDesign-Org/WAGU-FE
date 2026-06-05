import { ApiError, isAuthError } from '../../../api/client';
import { getMyInfo } from '../../../api/wagu';

export const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const isUserNotFoundApiError = (error: unknown) =>
  error instanceof ApiError && error.message.includes('유저를 찾을 수 없습니다');

export const getReadableApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const waitForServerUserReady = async (token: string, attempts = 3) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await getMyInfo(token);
      return true;
    } catch (error) {
      if (attempt === attempts - 1) {
        return false;
      }

      if (!isUserNotFoundApiError(error) && !isAuthError(error)) {
        return false;
      }

      await delay(450 * (attempt + 1));
    }
  }

  return false;
};
