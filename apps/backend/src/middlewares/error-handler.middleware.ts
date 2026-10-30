import type { Context, ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import type { ApiErrorResponse, ValidationErrorDetail } from '@ermes/shared';

export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
  if (err instanceof ZodError) {
    const details: ValidationErrorDetail[] = err.issues.map((issue) => ({
      path: issue.path.map(String),
      message: issue.message,
      code: issue.code,
    }));

    const response: ApiErrorResponse = {
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 400,
      details,
      timestamp: new Date().toISOString(),
    };
    return c.json(response, 400);
  }

  if (err instanceof HTTPException) {
    const status = err.status;
    const response: ApiErrorResponse = {
      error: err.name || 'HTTP_EXCEPTION',
      message: err.message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    };
    return c.json(response, status);
  }

  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    const response: ApiErrorResponse = {
      error: 'BAD_REQUEST',
      message: 'Malformed JSON payload in request body',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    };
    return c.json(response, 400);
  }
  console.error('Fail-Secure Error:', err.message);

  const response: ApiErrorResponse = {
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected internal error occurred',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };

  return c.json(response, 500);
};

/**
 * Centralized fail-secure 404 handler.
 */
export function notFoundHandler(c: Context) {
  const response: ApiErrorResponse = {
    error: 'NOT_FOUND',
    message: `Resource not found: ${c.req.method} ${c.req.path}`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  };
  return c.json(response, 404);
}
