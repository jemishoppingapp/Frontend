/**
 * Client-side API fetcher. Wraps fetch() with:
 *   - Always sends JSON
 *   - Always parses JSON
 *   - Throws a typed ApiError if the response is { ok: false }
 *   - Returns the .data payload on success
 *
 * Usage in a component:
 *   try {
 *     const { user } = await apiFetch<{ user: User }>('/api/auth/login', {
 *       method: 'POST',
 *       body: { email, password },
 *     });
 *   } catch (err) {
 *     if (err instanceof ApiError) {
 *       toast.error(err.message);
 *       // err.code for switch, err.field for inline display
 *     }
 *   }
 */

export type ErrorCode =
  | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN' | 'WRONG_CURRENT_PASSWORD'
  | 'PASSWORD_MISMATCH' | 'PROFILE_INCOMPLETE' | 'CART_EMPTY'
  | 'PRODUCT_NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'PAYMENT_INIT_FAILED'
  | 'PAYMENT_VERIFY_FAILED' | 'PAYMENT_NOT_SUCCESSFUL' | 'ORDER_NOT_FOUND'
  | 'ORDER_EXPIRED' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'NETWORK_ERROR';

export class ApiError extends Error {
  code: ErrorCode;
  field?: string;
  status: number;
  constructor(code: ErrorCode, message: string, status: number, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.field = field;
    this.status = status;
  }
}

interface FetchOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function apiFetch<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
    signal: opts.signal,
  };
  if (opts.body !== undefined && method !== 'GET') {
    init.body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    // Network failed (offline, DNS issue, etc.) — never reached the server.
    throw new ApiError('NETWORK_ERROR', 'Connection problem. Check your internet and try again.', 0);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    // Server responded with non-JSON (rare — usually means a crash)
    throw new ApiError(
      'SERVER_ERROR',
      'Got an unexpected response from the server. Please try again.',
      res.status
    );
  }

  if (typeof body !== 'object' || body === null || !('ok' in body)) {
    throw new ApiError('SERVER_ERROR', 'Unexpected response shape.', res.status);
  }

  const envelope = body as { ok: boolean; data?: T; error?: { code: ErrorCode; message: string; field?: string } };

  if (envelope.ok && envelope.data !== undefined) {
    return envelope.data;
  }

  if (!envelope.ok && envelope.error) {
    throw new ApiError(envelope.error.code, envelope.error.message, res.status, envelope.error.field);
  }

  throw new ApiError('SERVER_ERROR', 'Unexpected response from the server.', res.status);
}