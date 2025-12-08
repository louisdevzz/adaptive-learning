import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Export all schemas for use in application
export * from './schema';
