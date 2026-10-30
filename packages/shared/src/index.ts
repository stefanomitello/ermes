import { z } from 'zod';

export const HttpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
]);
export type HttpMethod = z.infer<typeof HttpMethodSchema>;

export const TrafficLogEntrySchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().datetime(),
  agentId: z.string().min(1),
  userId: z.string().min(1),
  method: HttpMethodSchema,
  url: z.string().url(),
  headers: z.record(z.string()),
  body: z.string().optional(),
  statusCode: z.number().int().min(100).max(599).optional(),
  durationMs: z.number().nonnegative().optional(),
  threatScore: z.number().min(0).max(100).optional(),
  threatTags: z.array(z.string()).default([]),
  receivedAt: z.string().datetime().optional(),
});
export type TrafficLogEntry = z.infer<typeof TrafficLogEntrySchema>;

export const BatchTrafficLogsSchema = z.object({
  logs: z.array(TrafficLogEntrySchema).min(1),
});
export type BatchTrafficLogs = z.infer<typeof BatchTrafficLogsSchema>;

export const AgentCredentialsSchema = z.object({
  agentId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  userId: z.string().min(1),
});
export type AgentCredentials = z.infer<typeof AgentCredentialsSchema>;

export const AgentConfigSchema = z.object({
  backendUrl: z.string().url().default('http://localhost:3000'),
  agentId: z.string().min(1).default('agent-worker-01'),
  authToken: z.string().min(1).optional(),
  simulationIntervalMs: z.coerce.number().int().positive().default(1000),
  userId: z.string().min(1).default('user-endpoint-42'),
});
export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export const TrafficLogsFilterSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
  cursor: z.string().optional(),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  method: HttpMethodSchema.optional(),
  threatScoreMin: z.coerce.number().min(0).max(100).optional(),
  threatScoreMax: z.coerce.number().min(0).max(100).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
export type TrafficLogsFilter = z.infer<typeof TrafficLogsFilterSchema>;

export const TrafficLogsListResponseSchema = z.object({
  logs: z.array(TrafficLogEntrySchema),
  total: z.number().int().nonnegative().optional(),
  nextCursor: z.string().optional(),
});
export type TrafficLogsListResponse = z.infer<typeof TrafficLogsListResponseSchema>;

export const ValidationErrorDetailSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
  code: z.string().optional(),
});
export type ValidationErrorDetail = z.infer<typeof ValidationErrorDetailSchema>;

export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int().min(400).max(599).optional(),
  details: z.array(ValidationErrorDetailSchema).optional(),
  timestamp: z.string().datetime().optional(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const AuthTokenRequestSchema = AgentCredentialsSchema;
export type AuthTokenRequest = z.infer<typeof AuthTokenRequestSchema>;

export const AuthTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().positive(),
});
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;

export const ClerkSessionClaimsSchema = z.object({
  sub: z.string().min(1),
  iss: z.string().url().optional(),
  exp: z.number().int(),
  iat: z.number().int().optional(),
  nbf: z.number().int().optional(),
  sid: z.string().optional(),
  org_id: z.string().optional(),
  org_slug: z.string().optional(),
  org_role: z.string().optional(),
  org_permissions: z.array(z.string()).optional(),
  email: z.string().email().optional(),
});
export type ClerkSessionClaims = z.infer<typeof ClerkSessionClaimsSchema>;

export const AuthContextSchema = z.object({
  type: z.enum(['user', 'agent']),
  userId: z.string().min(1),
  agentId: z.string().optional(),
  orgId: z.string().optional(),
  roles: z.array(z.string()).default([]),
});
export type AuthContext = z.infer<typeof AuthContextSchema>;
