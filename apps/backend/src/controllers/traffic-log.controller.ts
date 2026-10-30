import type { Context } from 'hono';
import type { TrafficLogEntry, BatchTrafficLogs, TrafficLogsFilter } from '@ermes/shared';
import { TrafficLogService } from '../services/traffic-log.service.js';

export class TrafficLogController {
  constructor(private readonly service: TrafficLogService = new TrafficLogService()) {}

  async ingestTrafficLogs(c: Context) {
    const body = c.req.valid('json' as never) as TrafficLogEntry | BatchTrafficLogs;
    const logsToIngest = 'logs' in body ? body.logs : [body];

    const result = await this.service.ingestLogs(logsToIngest);

    return c.json(
      {
        success: true,
        count: result.count,
        receivedAt: result.receivedAt,
      },
      201
    );
  }

  async getTrafficLogs(c: Context) {
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
  }
}

export const defaultTrafficLogController = new TrafficLogController();

export const ingestTrafficLogsController = (c: Context) =>
  defaultTrafficLogController.ingestTrafficLogs(c);

export const getTrafficLogsController = (c: Context) =>
  defaultTrafficLogController.getTrafficLogs(c);
