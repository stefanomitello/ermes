import { zValidator } from '@hono/zod-validator';
import type { ZodTypeAny } from 'zod';
import type { ApiErrorResponse, ValidationErrorDetail } from '@ermes/shared';

export function validateJson<T extends ZodTypeAny>(schema: T) {
  return zValidator('json', schema, (result, c) => {
    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
        path: issue.path.map(String),
        message: issue.message,
        code: issue.code,
      }));

      const errorPayload: ApiErrorResponse = {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request body payload',
        statusCode: 400,
        details,
        timestamp: new Date().toISOString(),
      };

      return c.json(errorPayload, 400);
    }
  });
}

export function validateQuery<T extends ZodTypeAny>(schema: T) {
  return zValidator('query', schema, (result, c) => {
    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
        path: issue.path.map(String),
        message: issue.message,
        code: issue.code,
      }));

      const errorPayload: ApiErrorResponse = {
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        statusCode: 400,
        details,
        timestamp: new Date().toISOString(),
      };

      return c.json(errorPayload, 400);
    }
  });
}
