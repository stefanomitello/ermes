import { Hono } from 'hono';
import { AuthTokenRequestSchema } from '@ermes/shared';
import { issueAgentTokenController } from '../controllers/auth.controller.js';
import { validateJson } from '../middlewares/validator.middleware.js';

export const authRouter = new Hono();

authRouter.post('/agent/token', validateJson(AuthTokenRequestSchema), issueAgentTokenController);
