import type { ObjectId } from 'mongodb';
import { TrafficLogEntrySchema, type TrafficLogEntry } from '@ermes/shared';

export interface TrafficLogDocument extends Omit<TrafficLogEntry, 'id'> {
  _id?: ObjectId;
  receivedAt: string;
}

export interface InsertBatchResult {
  insertedCount: number;
  insertedIds: Record<number, ObjectId>;
}

export function validateTrafficLogEntry(input: unknown): TrafficLogEntry {
  return TrafficLogEntrySchema.parse(input);
}
