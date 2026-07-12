import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

// Sessions — sesi analisa
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  clientName: text('client_name'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  status: text('status').notNull().default('active'), // active, archived
});

// Plants — data pabrik hasil ekstraksi
export const plants = sqliteTable('plants', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  name: text('name'),
  tariff: text('tariff'), // misal "I-3/TM"
  lwbpRate: real('lwbp_rate'), // Rp/kWh
  wbpRate: real('wbp_rate'), // Rp/kWh
  kwhLwbp: real('kwh_lwbp'), // kWh per bulan
  kwhWbp: real('kwh_wbp'), // kWh per bulan
  kwhTotal: real('kwh_total'),
  billMonth: real('bill_month'), // Rp
  kvaCharge: real('kva_charge'), // Rp per kVA per month
  kvaMax: real('kva_max'),
  trafoKva: real('trafo_kva'),
  installedKw: real('installed_kw'),
  peakKw: real('peak_kw'),
  nightBaseKw: real('night_base_kw'),
  roofM2: real('roof_m2'),
  shifts: integer('shifts'),
  wbpStart: integer('wbp_start'),
  wbpEnd: integer('wbp_end'),
  extractedAt: integer('extracted_at', { mode: 'timestamp_ms' }),
});

// Scenarios — konfigurasi skenario simulasi
export const scenarios = sqliteTable('scenarios', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  pvCapacityKwp: real('pv_capacity_kwp').notNull(),
  bessCapacityKwh: real('bess_capacity_kwh').notNull(),
  roofUsedM2: real('roof_used_m2').notNull(),
  bessCostPerKwh: real('bess_cost_per_kwh').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
});

// Documents — metadata file yang diupload
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  docType: text('doc_type').notNull(), // "bill" atau "sld"
  uploadedAt: integer('uploaded_at', { mode: 'timestamp_ms' }).notNull(),
  extractionStatus: text('extraction_status').notNull().default('pending'), // pending, completed, failed
  extractedData: text('extracted_data'), // JSON string dari hasil ekstraksi
});

// AI Messages — riwayat tanya-jawab dengan analis AI
export const aiMessages = sqliteTable('ai_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // "user" atau "assistant"
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
