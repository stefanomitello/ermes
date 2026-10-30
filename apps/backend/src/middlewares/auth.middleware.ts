import type { Context, Next } from 'hono';
import type { ApiErrorResponse, AuthContext } from '@ermes/shared';
import { defaultAuthService, AuthService } from '../services/auth.service.js';

export interface AuthMiddlewareOptions {
  allowAnonymous?: boolean;
  allowedTypes?: Array<'user' | 'agent'>;
  authService?: AuthService;
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
    user: AuthContext;
  }
}

export function authMiddleware(options?: AuthMiddlewareOptions) {
  const service = options?.authService || defaultAuthService;

  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      if (options?.allowAnonymous) {
        return next();
      }
      const response: ApiErrorResponse = {
        error: 'UNAUTHORIZED',
        message: 'Missing Authorization header with Bearer token',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
      return c.json(response, 401);
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      const response: ApiErrorResponse = {
        error: 'UNAUTHORIZED',
        message: 'Invalid Authorization header format. Expected "Bearer <token>"',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
      return c.json(response, 401);
    }

    const token = parts[1];

    try {
      const authContext = await service.authenticate(token);

      if (options?.allowedTypes && !options.allowedTypes.includes(authContext.type)) {
        const response: ApiErrorResponse = {
          error: 'FORBIDDEN',
          message: `Access denied for principal type "${authContext.type}". Required: ${options.allowedTypes.join(', ')}`,
          statusCode: 403,
          timestamp: new Date().toISOString(),
        };
        return c.json(response, 403);
      }

      c.set('auth', authContext);
      c.set('user', authContext);

      await next();
    } catch (err) {
      const response: ApiErrorResponse = {
        error: 'UNAUTHORIZED',
        message: (err as Error).message || 'Invalid or expired token',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
      return c.json(response, 401);
    }
  };
}
