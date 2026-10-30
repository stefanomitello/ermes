import type { TrafficLogEntry, TrafficLogsFilter, TrafficLogsListResponse } from '@ermes/shared';
import {
  type TrafficLogRepository,
  defaultTrafficLogRepository,
} from '../repositories/traffic-log.repository.js';
import { validateTrafficLogEntry, type TrafficLogDocument } from '../models/traffic-log.model.js';

export interface TrafficLogIngestResult {
  count: number;
  receivedAt: string;
}

export class TrafficLogService {
  constructor(private readonly repository: TrafficLogRepository = defaultTrafficLogRepository) {}

  async ingestLogs(
    logs: TrafficLogEntry | TrafficLogEntry[],
    context?: { userId?: string; agentId?: string }
  ): Promise<TrafficLogIngestResult> {
    const list = Array.isArray(logs) ? logs : [logs];
    const receivedAt = new Date().toISOString();

    const documents: TrafficLogDocument[] = list.map((log) => {
      const validated = validateTrafficLogEntry(log);
      return {
        ...validated,
        userId: context?.userId || validated.userId || 'anonymous-user',
        agentId: context?.agentId || validated.agentId || 'unknown-agent',
        receivedAt,
      };
    });

    if (documents.length > 0) {
      await this.repository.insertBatch(documents);
    }

    return {
      count: documents.length,
      receivedAt,
    };
  }

  async getLogs(filter?: TrafficLogsFilter): Promise<TrafficLogsListResponse> {
    const sanitizedFilter: TrafficLogsFilter = {
      ...filter,
      limit: Math.min(Math.max(filter?.limit ?? 50, 1), 100),
      page: Math.max(filter?.page ?? 1, 1),
    };

    const docs = await this.repository.findLogs(sanitizedFilter);
    const total = await this.repository.countLogs(sanitizedFilter);

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

export const defaultTrafficLogService = new TrafficLogService();
