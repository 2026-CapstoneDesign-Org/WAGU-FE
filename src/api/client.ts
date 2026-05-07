const API_BASE_URL = 'http://ec2-13-209-162-63.ap-northeast-2.compute.amazonaws.com:8080';

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  query?: Record<string, QueryValue>;
  token?: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function parseResponseBody(text: string, contentType: string | null) {
  if (!text) {
    return null;
  }

  if (contentType?.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type');
  const text = await response.text();
  const parsedBody = parseResponseBody(text, contentType);

  if (contentType?.includes('text/html')) {
    throw new ApiError('로그인이 필요합니다.', response.status || 401, parsedBody);
  }

  if (!response.ok) {
    const message =
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      'message' in parsedBody &&
      typeof parsedBody.message === 'string'
        ? parsedBody.message
        : '요청을 처리하지 못했습니다.';

    throw new ApiError(message, response.status, parsedBody);
  }

  return parsedBody as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function isAuthError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}
