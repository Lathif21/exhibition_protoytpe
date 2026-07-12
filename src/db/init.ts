import { Database } from 'bun:sqlite';
import { db } from './index';

/**
 * Initialize database — create tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    const dbPath = process.env.DATABASE_URL || './local.db';
    const sqlite = new Database(dbPath);

    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        client_name TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS plants (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        name TEXT,
        tariff TEXT,
        lwbp_rate REAL,
        wbp_rate REAL,
        kwh_lwbp REAL,
        kwh_wbp REAL,
        kwh_total REAL,
        bill_month REAL,
        kva_charge REAL,
        kva_max REAL,
        trafo_kva REAL,
        installed_kw REAL,
        peak_kw REAL,
        night_base_kw REAL,
        roof_m2 REAL,
        shifts INTEGER,
        wbp_start INTEGER,
        wbp_end INTEGER,
        extracted_at INTEGER,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        name TEXT NOT NULL,
        pv_capacity_kwp REAL NOT NULL,
        bess_capacity_kwh REAL NOT NULL,
        roof_used_m2 REAL NOT NULL,
        bess_cost_per_kwh REAL NOT NULL,
        created_at INTEGER NOT NULL,
        is_active INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        uploaded_at INTEGER NOT NULL,
        extraction_status TEXT NOT NULL DEFAULT 'pending',
        extracted_data TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ai_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );
    `);

    console.log('✓ Database initialized with tables');
  } catch (error: any) {
    console.error('Database init error:', error.message);
  }
}

export async function seedDatabase() {
  // Optional: add default/demo data if needed
}
