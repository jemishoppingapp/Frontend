/**
 * Standard API response shape and helpers.
 *
 * Every API route returns either:
 *   200/2xx: { ok: true, data: ... }
 *   4xx/5xx: { ok: false, error: { code, message, field? } }
 *
 * The `code` is a stable UPPER_SNAKE_CASE string the client can switch
 * on. The `message` is a human-readable, conversational sentence
 * suitable for showing in a toast or inline. The optional `field` is
 * the name of the form field the error applies to (for inline display).
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'WRONG_CURRENT_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'PROFILE_INCOMPLETE'
  | 'CART_EMPTY'
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'PAYMENT_INIT_FAILED'
  | 'PAYMENT_VERIFY_FAILED'
  | 'PAYMENT_NOT_SUCCESSFUL'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_EXPIRED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR';

const CODE_TO_STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  INVALID_CREDENTIALS: 401,
  EMAIL_TAKEN: 409,
  WRONG_CURRENT_PASSWORD: 401,
  PASSWORD_MISMATCH: 400,
  PROFILE_INCOMPLETE: 403,
  CART_EMPTY: 400,
  PRODUCT_NOT_FOUND: 400,
  INSUFFICIENT_STOCK: 400,
  PAYMENT_INIT_FAILED: 502,
  PAYMENT_VERIFY_FAILED: 502,
  PAYMENT_NOT_SUCCESSFUL: 402,
  ORDER_NOT_FOUND: 404,
  ORDER_EXPIRED: 410,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};

export interface ApiErrorPayload {
  code: ErrorCode;
  message: string;
  field?: string;
}

export interface ApiSuccess<T> { ok: true; data: T; }
export interface ApiFailure { ok: false; error: ApiErrorPayload; }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/**
 * Server-throwable error. Use inside route handlers — the catch-all
 * wrapper (`withErrorHandling`) converts it to the right response.
 */
export class ApiServerError extends Error {
  code: ErrorCode;
  field?: string;
  constructor(code: ErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'ApiServerError';
    this.code = code;
    this.field = field;
  }
}

/** 200 OK with `{ ok: true, data }`. */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data } as ApiSuccess<T>, { status });
}

/** Error response with auto status code from the registry. */
export function fail(code: ErrorCode, message: string, field?: string): NextResponse<ApiFailure> {
  const status = CODE_TO_STATUS[code] ?? 500;
  const payload: ApiFailure = { ok: false, error: { code, message, ...(field ? { field } : {}) } };
  return NextResponse.json(payload, { status });
}

/** Zod error → standard VALIDATION_ERROR with the first error's path/message. */
export function failValidation(err: z.ZodError): NextResponse<ApiFailure> {
  const first = err.errors[0];
  const field = first?.path?.length ? String(first.path[0]) : undefined;
  const message = first?.message ?? 'Please check your input.';
  return fail('VALIDATION_ERROR', message, field);
}

/**
 * Wrap a route handler so any thrown ApiServerError becomes the right
 * response automatically, and any unhandled error becomes a generic
 * SERVER_ERROR with no internal details leaked.
 */
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T> | ApiFailure>> {
  try {
    return await handler();
  } catch (e) {
    if (e instanceof ApiServerError) {
      return fail(e.code, e.message, e.field);
    }
    // eslint-disable-next-line no-console
    console.error('[api] unhandled error:', e);
    return fail('SERVER_ERROR', 'Something went wrong on our end. Please try again.');
  }
}