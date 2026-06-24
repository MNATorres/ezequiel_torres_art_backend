import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  // A Mongo connection string — accepts both mongodb:// (incl. multi-host) and
  // mongodb+srv://. Not validated as a strict URL: the standard multi-host form
  // (host1,host2,host3) is not a valid WHATWG URL.
  MONGO_URI: z.string().startsWith('mongodb', 'MONGO_URI must be a MongoDB connection string'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('1d'),
  // Public base URL of this API, used to build absolute URLs for uploaded files.
  API_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
