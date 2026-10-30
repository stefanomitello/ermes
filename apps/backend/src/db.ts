import { MongoClient, Db, type Collection } from 'mongodb';
import type { TrafficLogDocument } from './models/traffic-log.model.js';

export { type TrafficLogDocument } from './models/traffic-log.model.js';
export const TRAFFIC_LOGS_COLLECTION = 'traffic_logs';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(
  uri?: string,
  dbName = 'ermes'
): Promise<{ client: MongoClient; db: Db }> {
  if (!client) {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/ermes';
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(dbName);

    await ensureIndexes(db);
  }

  return { client, db: db! };
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectMongo() first.');
  }
  return db;
}

export function getTrafficLogsCollection(database?: Db): Collection<TrafficLogDocument> {
  const targetDb = database || getDb();
  return targetDb.collection<TrafficLogDocument>(TRAFFIC_LOGS_COLLECTION);
}

export async function ensureIndexes(database: Db): Promise<void> {
  const collection = database.collection(TRAFFIC_LOGS_COLLECTION);
  await collection.createIndex({ agentId: 1, timestamp: -1 }, { name: 'idx_agent_timestamp' });
  await collection.createIndex({ timestamp: -1 }, { name: 'idx_timestamp' });
  await collection.createIndex({ userId: 1 }, { name: 'idx_user' });
  await collection.createIndex({ threatScore: 1 }, { name: 'idx_threat_score' });
}
export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
