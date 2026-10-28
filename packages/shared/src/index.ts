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
