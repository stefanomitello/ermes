import type { Context } from 'hono';
import type { AuthTokenRequest } from '@ermes/shared';
import { AuthService, defaultAuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(private readonly authService: AuthService = defaultAuthService) {}

  issueAgentToken = async (c: Context) => {
    const credentials = c.req.valid('json' as never) as AuthTokenRequest;
    const tokenResponse = await this.authService.generateAgentToken(credentials);
    return c.json(tokenResponse, 200);
  };
}

export const defaultAuthController = new AuthController();
export const issueAgentTokenController = defaultAuthController.issueAgentToken;
