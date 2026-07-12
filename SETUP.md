# Setup: Tech Stack Target — Bun + Elysia + Drizzle + SQLite

## ✓ Selesai

### Instalasi & Konfigurasi
- [x] **Bun** (runtime) — v1.3.14 terdeteksi
- [x] **Elysia JS** (framework backend) — installed, menggantikan Express
- [x] **Drizzle ORM** — installed
- [x] **SQLite** — built-in Bun (bun:sqlite)
- [x] Environment (.env) — configured

### Struktur Proyek
```
prototype/
├── index.html                # Frontend (tidak berubah)
├── server.ts                 # Entry Elysia (new)
├── src/
│   ├── db/
│   │   ├── schema.ts         # Drizzle skema (5 entitas: sessions, plants, scenarios, documents, ai_messages)
│   │   └── index.ts          # Koneksi database
│   ├── routes/               # (siap untuk Fase 2: sessions, documents)
│   └── services/             # (siap untuk Fase 3: ekstraksi dokumen)
├── .env                      # API key + DATABASE_URL (local.db)
├── .gitignore                # Exclude: node_modules, .env, local.db
├── package.json              # Bun scripts: start, dev
└── bun.lockb                 # Lock file
```

### API Endpoints (Fase 1 — Fondasi)
Sudah berjalan:
- **GET** `http://localhost:3000/` — serve index.html
- **GET** `http://localhost:3000/health` — health check
- **POST** `http://localhost:3000/api/claude` — Claude via SumoPod
- **POST** `http://localhost:3000/api/openai` — OpenAI via SumoPod

## Cara Menjalankan

```bash
# Install dependencies (sudah dilakukan)
bun install

# Run development server (watch mode)
bun run dev

# Run production
bun run start
```

Server akan berjalan di `http://localhost:3000`

## Catatan

1. **Database** belum ada tabel — table akan dibuat saat:
   - Fase 2: Setup migrations (Drizzle) untuk membuat tabel
   - Schema sudah siap di `src/db/schema.ts`

2. **Frontend** tetap vanilla HTML/CSS/JS — update akan dilakukan di Fase 2 (save sesi) dan Fase 3 (upload dokumen).

3. **API Key** simpan di `.env`, jangan commit (sudah di `.gitignore`).

4. **Model AI** sesuaikan dengan model valid di SumoPod — saat ini: `claude-opus-4-8` dan `gpt-4o-mini`.

---

### Next Step

Lanjut ke **Fase 2** (Persistensi Data):
- Buat migrations untuk tabel Drizzle
- Tambah endpoint CRUD sessions, scenarios
- Update frontend untuk simpan/load sesi

Lihat [issue.md](issue.md) untuk detail planning.
