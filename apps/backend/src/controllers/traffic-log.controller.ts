import type { Context } from 'hono';
import type { TrafficLogEntry, BatchTrafficLogs, TrafficLogsFilter } from '@ermes/shared';
import { TrafficLogService, defaultTrafficLogService } from '../services/traffic-log.service.js';

export class TrafficLogController {
  constructor(private readonly service: TrafficLogService = defaultTrafficLogService) {}

  ingestTrafficLogs = async (c: Context) => {
    const body = c.req.valid('json' as never) as TrafficLogEntry | BatchTrafficLogs;
    const logsToIngest = 'logs' in body ? body.logs : [body];
    const auth = typeof c.get === 'function' ? c.get('auth') : undefined;

    const result = await this.service.ingestLogs(logsToIngest, {
      userId: auth?.userId,
      agentId: auth?.agentId,
    });

    return c.json(
      {
        success: true,
        count: result.count,
        receivedAt: result.receivedAt,
      },
      201
    );
  };

  getTrafficLogs = async (c: Context) => {
    const query = c.req.query();
    const filter: TrafficLogsFilter = {
      limit: query.limit ? Number(query.limit) : 50,
      page: query.page ? Number(query.page) : 1,
      agentId: query.agentId,
      userId: query.userId,
      method: query.method as TrafficLogsFilter['method'],
      threatScoreMin: query.threatScoreMin ? Number(query.threatScoreMin) : undefined,
      threatScoreMax: query.threatScoreMax ? Number(query.threatScoreMax) : undefined,
      search: query.search,
      startDate: query.startDate,
      endDate: query.endDate,
    };

    const response = await this.service.getLogs(filter);

    return c.json(
      {
        ...response,
        limit: filter.limit,
        agentId: filter.agentId || null,
      },
      200
    );
  };
}

export const defaultTrafficLogController = new TrafficLogController();

export const ingestTrafficLogsController = defaultTrafficLogController.ingestTrafficLogs;
export const getTrafficLogsController = defaultTrafficLogController.getTrafficLogs;
