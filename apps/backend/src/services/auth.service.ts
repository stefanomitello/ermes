import { jwtVerify, SignJWT, importSPKI, createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import {
  ClerkSessionClaimsSchema,
  type ClerkSessionClaims,
  type AuthContext,
  type AgentCredentials,
  type AuthTokenResponse,
} from '@ermes/shared';

export interface AuthServiceConfig {
  jwtSecret?: string;
  clerkJwtKey?: string;
  clerkJwksUrl?: string;
  issuer?: string;
  audience?: string;
}

export class AuthService {
  private readonly jwtSecretBytes: Uint8Array;
  private readonly clerkJwtKey?: string;
  private readonly clerkJwksUrl?: string;
  private readonly issuer?: string;
  private readonly audience?: string;
  private remoteJwkSet?: JWTVerifyGetKey;

  constructor(config?: AuthServiceConfig) {
    const secret =
      config?.jwtSecret || process.env.JWT_SECRET || 'ermes-development-secret-key-min-32-chars';
    this.jwtSecretBytes = new TextEncoder().encode(secret);

    this.clerkJwtKey =
      config?.clerkJwtKey || process.env.CLERK_JWT_KEY || process.env.CLERK_PEM_PUBLIC_KEY;

    this.clerkJwksUrl =
      config?.clerkJwksUrl ||
      process.env.CLERK_JWKS_URL ||
      process.env.AUTH_JWKS_URI ||
      process.env.AUTH_URI;

    this.issuer = config?.issuer || process.env.AUTH_ISSUER;
    this.audience = config?.audience || process.env.AUTH_AUDIENCE;

    if (this.clerkJwksUrl) {
      try {
        this.remoteJwkSet = createRemoteJWKSet(new URL(this.clerkJwksUrl));
      } catch (err) {
        console.warn(`[AuthService] Invalid JWKS URL: ${(err as Error).message}`);
      }
    }
  }

  async generateAgentToken(
    credentials: AgentCredentials,
    expiresInSeconds = 86400
  ): Promise<AuthTokenResponse> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;

    const token = await new SignJWT({
      sub: credentials.agentId,
      agentId: credentials.agentId,
      userId: credentials.userId,
      role: 'agent',
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(this.jwtSecretBytes);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
    };
  }

  async verifyAgentToken(token: string): Promise<AuthContext> {
    const { payload } = await jwtVerify(token, this.jwtSecretBytes, {
      algorithms: ['HS256'],
    });

    if (payload.role !== 'agent' || !payload.agentId || !payload.userId) {
      throw new Error('Invalid Agent token claims');
    }

    return {
      type: 'agent',
      agentId: String(payload.agentId),
      userId: String(payload.userId),
      roles: ['agent'],
    };
  }

  async verifyClerkToken(token: string): Promise<AuthContext> {
    const verifyOptions: Record<string, unknown> = {};
    if (this.issuer) verifyOptions.issuer = this.issuer;
    if (this.audience) verifyOptions.audience = this.audience;

    let payload: Record<string, unknown>;

    if (this.clerkJwtKey) {
      const publicKey = await importSPKI(this.clerkJwtKey, 'RS256');
      const result = await jwtVerify(token, publicKey, verifyOptions);
      payload = result.payload as Record<string, unknown>;
    } else if (this.remoteJwkSet) {
      const result = await jwtVerify(token, this.remoteJwkSet, verifyOptions);
      payload = result.payload as Record<string, unknown>;
    } else {
      throw new Error(
        'Clerk verification key not configured (set CLERK_JWT_KEY or CLERK_JWKS_URL)'
      );
    }

    const claims: ClerkSessionClaims = ClerkSessionClaimsSchema.parse(payload);

    const roles: string[] = [];
    if (claims.org_role) {
      roles.push(claims.org_role);
    }
    if (claims.org_permissions && Array.isArray(claims.org_permissions)) {
      roles.push(...claims.org_permissions);
    }

    return {
      type: 'user',
      userId: claims.sub,
      orgId: claims.org_id,
      roles,
    };
  }

  async authenticate(token: string): Promise<AuthContext> {
    try {
      return await this.verifyAgentToken(token);
    } catch {
      // Not a valid agent token, try Clerk token verification
    }

    try {
      return await this.verifyClerkToken(token);
    } catch (clerkErr) {
      throw new Error(`Authentication failed: ${(clerkErr as Error).message}`, {
        cause: clerkErr,
      });
    }
  }
}

export const defaultAuthService = new AuthService();
