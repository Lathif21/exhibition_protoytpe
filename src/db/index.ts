import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

const dbPath = process.env.DATABASE_URL || './local.db';
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export type DatabaseType = typeof db;
