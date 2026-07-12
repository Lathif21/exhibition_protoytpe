# Planning: BEFISIEN // EPP — Penyempurnaan Prototype

> Dokumen perencanaan tingkat tinggi untuk melengkapi prototype "Sintesis Kapital Energi"
> (analisa investasi PLTS + BESS dengan Digital Twin). Ditujukan untuk implementasi oleh programmer.

---

## 1. Konteks

Prototype saat ini adalah **single-page app** (`index.html`) yang mensimulasikan analisa
investasi energi surya + baterai untuk pabrik. Semua kalkulasi finansial berjalan di sisi
client, dan analisa AI dilewatkan ke backend proxy sederhana (`server.js`, saat ini Express).

**Kondisi sekarang:**
- Data pabrik (`PLANT`) masih **hardcoded** di frontend.
- Upload dokumen (rekening PLN & Single Line Diagram) masih **simulasi** — hanya animasi log, tidak ada file betulan yang diproses.
- Tidak ada **penyimpanan data** — sesi analisa hilang saat refresh.
- Backend hanya proxy AI, belum ada database.

**Tujuan akhir:** Ubah prototype menjadi aplikasi fungsional yang bisa menerima dokumen
nyata, mengekstrak data via AI, menyimpan hasil, dan memungkinkan pengguna kembali ke sesi lama.

---

## 2. Tech Stack Target

| Komponen | Teknologi |
|---|---|
| Runtime | **Bun** |
| Backend framework | **Elysia JS** (ganti Express) |
| ORM / Database | **Drizzle ORM + SQLite** (ringan, tanpa server DB) |
| AI Gateway | SumoPod (`https://ai.sumopod.com/v1`) — Claude & OpenAI |
| Frontend | Tetap HTML/CSS/JS vanilla (tidak perlu framework) |

> **Keputusan:** pakai **SQLite dulu** untuk demo agar ringan & cepat setup. Migrasi ke
> Postgres **di luar scope** saat ini — jangan tambahkan abstraksi ekstra untuk itu sekarang.

---

## 3. Sasaran Fitur (Prioritas)

### Fase 1 — Fondasi Backend (wajib)
- Migrasikan `server.js` dari Express ke **Elysia JS**.
- Pertahankan endpoint AI yang sudah ada (`/api/claude`, `/api/openai`) — hanya ganti framework, logika tetap.
- Tambahkan **Drizzle + SQLite** (mis. `bun:sqlite`). Siapkan config & migrasi.
- API key tetap dari `.env` (jangan hardcode).

### Fase 2 — Persistensi Data
- Buat skema database untuk menyimpan **sesi analisa** beserta data pabrik, konfigurasi skenario, dan riwayat tanya-jawab AI.
- Endpoint untuk: buat sesi baru, simpan konfigurasi (PV/BESS/atap), ambil daftar sesi, dan ambil detail satu sesi.
- Frontend: simpan otomatis perubahan slider ke sesi aktif; tambahkan cara memuat sesi lama.

### Fase 3 — Upload & Ekstraksi Dokumen Nyata
- Ganti simulasi upload menjadi **upload file betulan** (PDF rekening PLN & SLD).
- Backend menerima file, kirim ke AI (via SumoPod) untuk **mengekstrak data terstruktur** (tarif, pemakaian kWh, kVA, kapasitas trafo, luas atap, dst).
- Hasil ekstraksi mengisi objek `PLANT` secara dinamis, menggantikan nilai hardcoded.
- Simpan metadata dokumen & hasil ekstraksi ke database.

### Fase 4 — Perbaikan & Pelengkap
- Ganti model AI yang tidak valid — pakai model yang benar-benar tersedia di SumoPod.
- Tangani error dengan jelas di UI (misal AI gagal → tampilkan pesan, angka tabel tetap tampil).
- Loading state saat upload/ekstraksi/analisa.

---

## 4. Skema Database (High Level)

Cukup rancang entitas berikut dengan Drizzle (nama & relasi bebas disesuaikan):

- **sessions** — satu sesi analisa. Menyimpan nama klien, timestamp, dan status.
- **plants** — data pabrik hasil ekstraksi (tarif, kWh LWBP/WBP, kVA, trafo, luas atap, dsb). Terkait ke satu session.
- **scenarios** — konfigurasi skenario (kapasitas PV, BESS, luas atap terpakai, harga BESS). Bisa banyak per session.
- **documents** — metadata file yang diupload (nama, tipe, hasil ekstraksi mentah). Terkait ke session.
- **ai_messages** — riwayat tanya-jawab dengan analis AI. Terkait ke session.

> Detail kolom & tipe data diserahkan ke implementator. Gunakan foreign key sewajarnya.

---

## 5. Struktur Proyek yang Disarankan

```
prototype/
├── index.html            # frontend (perbaiki bagian upload & load sesi)
├── server.ts             # entry Elysia (ganti server.js)
├── src/
│   ├── routes/           # grup endpoint: ai, sessions, documents
│   ├── db/
│   │   ├── schema.ts     # skema Drizzle
│   │   └── index.ts      # koneksi db
│   └── services/         # logika AI & ekstraksi dokumen
├── drizzle.config.ts
├── local.db              # file SQLite (masuk .gitignore)
├── .env                  # SUMOPOD_API_KEY, PORT, DATABASE_URL (path file SQLite)
└── package.json
```

---

## 6. Kontrak API (High Level)

Pertahankan gaya JSON sederhana. Endpoint yang dibutuhkan (nama bebas):

- **AI** — proxy chat ke Claude/OpenAI (sudah ada, tinggal port ke Elysia).
- **Sessions** — CRUD dasar: buat, daftar, ambil detail, update konfigurasi skenario.
- **Documents** — upload file + trigger ekstraksi, kembalikan data pabrik terstruktur.

Response tetap ringkas (`{ text }`, `{ session }`, `{ plant }`, dst) agar frontend mudah konsumsi.

---

## 7. Perubahan Frontend

- Hubungkan tombol upload ke **file input asli**, kirim ke backend, tampilkan hasil ekstraksi di log.
- Isi `PLANT` & `LOAD` dari respons backend, bukan konstanta.
- Simpan perubahan slider ke backend (debounce, mirip pola `schedule()` yang sudah ada).
- Tambahkan panel/daftar untuk memilih & memuat sesi sebelumnya.
- Pertahankan seluruh logika kalkulasi & visualisasi (simulate, economics, drawChart) — sudah bagus, jangan dirombak.

---

## 8. Catatan Implementasi

- **Jangan hardcode API key** — selalu dari environment.
- **Gunakan SQLite dulu** untuk demo (ringan, tanpa server DB). Migrasi ke Postgres di luar scope — jangan tambahkan abstraksi ekstra untuknya sekarang.
- Simpan `.env` & file SQLite (`local.db`) di `.gitignore`.
- Migrasi harus **inkremental**: pastikan endpoint AI tetap jalan setelah pindah ke Elysia sebelum menambah database.
- Utamakan agar demo tetap berjalan mulus untuk pameran — stabilitas di atas kelengkapan fitur.
- Model AI: verifikasi nama model yang valid di SumoPod sebelum dipakai.

---

## 9. Definition of Done

- [ ] Backend berjalan di Elysia JS, endpoint AI berfungsi.
- [ ] Drizzle terpasang, migrasi jalan, database terisi saat analisa.
- [ ] Upload dokumen nyata → ekstraksi AI → data pabrik dinamis.
- [ ] Sesi analisa tersimpan & bisa dimuat ulang.
- [ ] Analisa AI tampil tanpa error; ada fallback jelas saat gagal.
- [ ] Tidak ada API key ter-hardcode di source.
