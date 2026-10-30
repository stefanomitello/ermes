import type { Db, Collection, Filter } from 'mongodb';
import type { TrafficLogsFilter } from '@ermes/shared';
import { TRAFFIC_LOGS_COLLECTION } from '../db.js';
import type { TrafficLogDocument, InsertBatchResult } from '../models/traffic-log.model.js';

/**
 * Port interface for Traffic Logs Data Access Layer (DAL).
 * Decoupled from transport and web frameworks (DIP).
 */
export interface TrafficLogRepository {
  insertSingle(doc: TrafficLogDocument): Promise<{ insertedId: string }>;
  insertBatch(docs: TrafficLogDocument[]): Promise<InsertBatchResult>;
  findLogs(filter?: TrafficLogsFilter): Promise<TrafficLogDocument[]>;
  countLogs(filter?: TrafficLogsFilter): Promise<number>;
}

/**
 * Concrete MongoDB native driver repository implementing TrafficLogRepository.
 */
export class MongoTrafficLogRepository implements TrafficLogRepository {
  private readonly collection: Collection<TrafficLogDocument>;

  constructor(db: Db) {
    this.collection = db.collection<TrafficLogDocument>(TRAFFIC_LOGS_COLLECTION);
  }

  /**
   * Builds a MongoDB filter from application filter options.
   */
  private buildMongoFilter(filter?: TrafficLogsFilter): Filter<TrafficLogDocument> {
    if (!filter) {
      return {};
    }

    const query: Filter<TrafficLogDocument> = {};

    if (filter.agentId) {
      query.agentId = filter.agentId;
    }

    if (filter.userId) {
      query.userId = filter.userId;
    }

    if (filter.method) {
      query.method = filter.method;
    }

    if (filter.threatScoreMin !== undefined || filter.threatScoreMax !== undefined) {
      query.threatScore = {};
      if (filter.threatScoreMin !== undefined) {
        query.threatScore.$gte = filter.threatScoreMin;
      }
      if (filter.threatScoreMax !== undefined) {
        query.threatScore.$lte = filter.threatScoreMax;
      }
    }

    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) {
        query.timestamp.$gte = filter.startDate;
      }
      if (filter.endDate) {
        query.timestamp.$lte = filter.endDate;
      }
    }

    if (filter.search) {
      // Escape regex special characters for security
      const escaped = filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.url = { $regex: escaped, $options: 'i' };
    }

    return query;
  }

  /**
   * Persists a single traffic log document into MongoDB.
   */
  async insertSingle(doc: TrafficLogDocument): Promise<{ insertedId: string }> {
    const result = await this.collection.insertOne(doc);
    return {
      insertedId: result.insertedId.toString(),
    };
  }

  /**
   * Persists a batch of traffic log documents into MongoDB.
   */
  async insertBatch(docs: TrafficLogDocument[]): Promise<InsertBatchResult> {
    if (docs.length === 0) {
      return { insertedCount: 0, insertedIds: {} };
    }

    const result = await this.collection.insertMany(docs);
    return {
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
    };
  }

  /**
   * Queries traffic logs applying filters, descending timeline sort and pagination.
   */
  async findLogs(filter?: TrafficLogsFilter): Promise<TrafficLogDocument[]> {
    const mongoFilter = this.buildMongoFilter(filter);
    const limit = Math.min(Math.max(filter?.limit ?? 50, 1), 100);
    const page = Math.max(filter?.page ?? 1, 1);
    const skip = (page - 1) * limit;

    return this.collection
      .find(mongoFilter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Counts the number of logs matching a filter query.
   */
  async countLogs(filter?: TrafficLogsFilter): Promise<number> {
    const mongoFilter = this.buildMongoFilter(filter);
    return this.collection.countDocuments(mongoFilter);
  }
}
