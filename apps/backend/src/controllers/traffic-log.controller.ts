import type { Context } from 'hono';
import type { TrafficLogEntry, BatchTrafficLogs } from '@ermes/shared';

export async function ingestTrafficLogsController(c: Context) {
  const body = c.req.valid('json' as never) as TrafficLogEntry | BatchTrafficLogs;
  const logsToIngest = 'logs' in body ? body.logs : [body];

  return c.json(
    {
      success: true,
      count: logsToIngest.length,
      receivedAt: new Date().toISOString(),
    },
    201
  );
}

export async function getTrafficLogsController(c: Context) {
  const agentId = c.req.query('agentId');
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100);

  return c.json(
    {
      logs: [],
      total: 0,
      limit,
      agentId: agentId || null,
    },
    200
  );
}
