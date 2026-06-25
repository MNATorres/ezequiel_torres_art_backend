import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

/**
 * Opens (or reuses) the Mongoose connection. Idempotent and serverless-safe:
 * if a connection is already open or connecting, it returns without
 * reconnecting. Throws on failure so the caller decides what to do — the local
 * server exits, a serverless request returns an error.
 */
export const connectDB = async () => {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState >= 1) return;

  const conn = await mongoose.connect(env.MONGO_URI);
  logger.info({ host: conn.connection.host }, '✅ MongoDB connected');
};
