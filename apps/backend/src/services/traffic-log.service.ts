import type { TrafficLogEntry, TrafficLogsFilter, TrafficLogsListResponse } from '@ermes/shared';
import type { TrafficLogRepository } from '../repositories/traffic-log.repository.js';
import type { TrafficLogDocument } from '../models/traffic-log.model.js';

export interface TrafficLogIngestResult {
  count: number;
  receivedAt: string;
}

/**
 * Service Layer: TrafficLogService
 * Pure business logic completely decoupled from Hono (req/res) and MongoDB native driver.
 * Uses TrafficLogRepository as an explicit dependency (Dependency Inversion).
 */
export class TrafficLogService {
  constructor(private readonly repository?: TrafficLogRepository) {}

  async ingestLogs(
    logs: TrafficLogEntry | TrafficLogEntry[],
    context?: { userId?: string; agentId?: string }
  ): Promise<TrafficLogIngestResult> {
    const list = Array.isArray(logs) ? logs : [logs];
    const receivedAt = new Date().toISOString();

    const documents: TrafficLogDocument[] = list.map((log) => ({
      ...log,
      userId: context?.userId || log.userId || 'anonymous-user',
      agentId: context?.agentId || log.agentId || 'unknown-agent',
      receivedAt,
    }));

    if (this.repository) {
      await this.repository.insertBatch(documents);
    }

    return {
      count: documents.length,
      receivedAt,
    };
  }

  async getLogs(filter?: TrafficLogsFilter): Promise<TrafficLogsListResponse> {
    if (!this.repository) {
      return { logs: [], total: 0 };
    }

    const docs = await this.repository.findLogs(filter);
    const total = await this.repository.countLogs(filter);

    const logs: TrafficLogEntry[] = docs.map((doc) => ({
      ...doc,
      id: doc._id?.toString(),
    }));

    return {
      logs,
      total,
    };
  }
}
