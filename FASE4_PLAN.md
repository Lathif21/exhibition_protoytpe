# Fase 4 — Perbaikan & Pelengkap

## Status Saat Ini
- ✅ Model AI valid: claude-opus-4-8, gpt-4o-mini
- ✅ Core features working: sessions, extraction, analysis
- ⏳ Error handling: basic (need improvement)
- ⏳ Loading states: missing (need to add)

---

## Sasaran Fase 4

### 1. Error Handling & User Feedback
**Backend:**
- Wrap all API calls dengan try-catch yang jelas
- Return error messages yang descriptive (bukan generic "API failed")
- Log errors di server untuk debugging

**Frontend:**
- Display error messages di UI (merah/warning)
- Tetap tampilkan data sebelumnya kalau error
- Show "Retry" button jika perlu
- Fallback messages untuk setiap skenario:
  - AI analysis gagal → "Analis AI tidak merespons. Gunakan data di tabel."
  - Upload gagal → "Dokumen tidak bisa diproses. Coba file lain."
  - Network error → "Koneksi error. Coba lagi."

### 2. Loading States & Visual Feedback
**Frontend Elements:**
- Upload dokumen: Show spinner + "Mengekstrak data..."
- AI Analysis: Spinner + "▸ menganalisis konfigurasi..."
- Q&A Submit: Disable button + "Menghitung..."
- Parameter slider: Delay indicator saat proses

**Implementation:**
- CSS spinner/loader animation
- Disable inputs saat loading
- Show progress/status text

### 3. Model AI Validation & Fallback
- ✅ Verify models available di SumoPod
- Fallback ke alternate model kalau primary gagal
- Log model failures untuk debugging

### 4. Polish & UX Improvements
- Improve error messages (clear, actionable)
- Better loading state messages (3-4 kalimat, Bahasa Indonesia)
- Timeout handling (jika API lama, show message)
- Confirm dialog saat upload dokumen

---

## Implementation Plan

### Backend Changes
**src/services/ai-service.ts:**
- Add verbose error messages
- Distinguish between different error types (network, API, model)
- Log errors ke console dengan timestamp

**src/routes/documents.ts:**
- Better error handling di upload
- Return detailed error messages
- Validate file size/type before processing

**src/routes/ai.ts:**
- Improve error responses
- Add fallback model support (optional)

### Frontend Changes
**index.html:**
- Add CSS spinner animation
- Update error display element (aiTx)
- Add fallback messages
- Improve loading state text
- Add event listeners untuk cancel/retry
- Timeout handling (jika response > 5s, show timeout message)

---

## Success Criteria (Definition of Done)

- [ ] Error messages jelas & user-friendly
- [ ] Loading spinners visible saat API call
- [ ] Fallback/error text muncul di UI jika API gagal
- [ ] Retry buttons functional kalau perlu
- [ ] No "hard errors" yang freeze UI
- [ ] Timeout handling (5s limit) untuk long-running API
- [ ] Model names correct & tested
- [ ] All endpoints have proper error responses
- [ ] UX smooth tanpa jarring transitions

---

## Priority Order

1. **Error Handling** (critical)
   - Backend error messages
   - Frontend error display
   - Fallback messages

2. **Loading States** (high)
   - CSS spinner animation
   - Loading text updates
   - Disable inputs during load

3. **Polish** (medium)
   - Timeout handling
   - Confirm dialogs
   - UX improvements

---

## Notes

- Keep error messages concise (1-2 baris max)
- All user-facing messages in Bahasa Indonesia
- Graceful degradation: data tetap useful even saat error
- No browser console errors
- Test dengan network slow/offline scenarios

---

## Test Scenarios

- [ ] API timeout → show message, tetap bisa lihat data
- [ ] API error (500) → show error, tetap bisa retry
- [ ] Invalid model → fallback atau error message
- [ ] Network disconnect → show offline message
- [ ] Slow response → show timeout indicator
- [ ] Multiple uploads → queue handling atau error
- [ ] Rapid parameter changes → cancel pending, start new
