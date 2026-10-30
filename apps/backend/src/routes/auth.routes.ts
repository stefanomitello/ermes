import { Hono } from 'hono';
import { AuthTokenRequestSchema, type AuthTokenRequest } from '@ermes/shared';
import { defaultAuthService } from '../services/auth.service.js';
import { validateJson } from '../middlewares/validator.middleware.js';

export const authRouter = new Hono();

authRouter.post('/agent/token', validateJson(AuthTokenRequestSchema), async (c) => {
  const credentials = c.req.valid('json' as never) as AuthTokenRequest;

  const tokenResponse = await defaultAuthService.generateAgentToken(credentials);

  return c.json(tokenResponse, 200);
});
