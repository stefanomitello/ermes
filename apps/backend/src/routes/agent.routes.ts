import { Hono } from 'hono';
import { BatchTrafficLogsSchema, TrafficLogEntrySchema } from '@ermes/shared';
import {
  ingestTrafficLogsController,
  getTrafficLogsController,
} from '../controllers/traffic-log.controller.js';
import { validateJson } from '../middlewares/validator.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const agentRouter = new Hono();

agentRouter.use('*', authMiddleware({ allowAnonymous: true }));

agentRouter.get('/traffic_logs', getTrafficLogsController);
agentRouter.post(
  '/traffic_logs',
  validateJson(BatchTrafficLogsSchema.or(TrafficLogEntrySchema)),
  ingestTrafficLogsController
);
