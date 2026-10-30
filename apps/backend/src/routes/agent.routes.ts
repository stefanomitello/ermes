import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { BatchTrafficLogsSchema, TrafficLogEntrySchema } from '@ermes/shared';
import {
  ingestTrafficLogsController,
  getTrafficLogsController,
} from '../controllers/traffic-log.controller.js';

export const agentRouter = new Hono();

agentRouter.get('/traffic_logs', getTrafficLogsController);
agentRouter.post(
  '/traffic_logs',
  zValidator('json', BatchTrafficLogsSchema.or(TrafficLogEntrySchema)),
  ingestTrafficLogsController
);
