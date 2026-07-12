# Fase 3 Manual Testing Guide

## Server Setup
```bash
cd "d:\Lathif Personal\Exhibition\prototype"
bun run dev
# Server akan running di http://localhost:3000
```

---

## Test 1: Create Session

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"clientName":"PT Surya Manufacturing"}'
```

**Expected Response:**
```json
{
  "id": "YOUR_SESSION_ID_HERE",
  "clientName": "PT Surya Manufacturing",
  "createdAt": 1783824528615
}
```

**Save the `id` value for next tests!**

---

## Test 2: Upload & Extract Bill (PLN Rekening)

Replace `{SESSION_ID}` dengan id dari Test 1

```bash
curl -X POST http://localhost:3000/api/documents/{SESSION_ID}/upload \
  -H "Content-Type: application/json" \
  -d '{"fileContent":"Golongan: I-3/TM\nTarif LWBP: Rp 1.122/kWh\nTarif WBP: Rp 1.683/kWh\nPemakaian LWBP: 245650 kWh\nPemakaian WBP: 61450 kWh\nTotal Tagihan: Rp 441498840\nBiaya Beban kVA: Rp 49600000\nkVA Max: 1240","docType":"bill","fileName":"bill_june2026.txt"}'
```

**Expected Response:**
```json
{
  "success": true,
  "documentId": "...",
  "extracted": {
    "tariff": "I-3/TM",
    "lwbpRate": 1122,
    "wbpRate": 1683,
    "kwhLwbp": 245650,
    "kwhWbp": 61450,
    "billMonth": 441498840,
    "kvaCharge": 49600000,
    "kvaMax": 1240
  },
  "message": "bill extracted and saved successfully"
}
```

---

## Test 3: Upload & Extract SLD (Single Line Diagram)

```bash
curl -X POST http://localhost:3000/api/documents/{SESSION_ID}/upload \
  -H "Content-Type: application/json" \
  -d '{"fileContent":"Trafo utama: 1600 kVA, 20kV/400V\nBeban terpasang: 1110 kW (5 feeder)\nBeban puncak: 1153 kW\nBeban dasar malam: 380 kW (shift-3 tetap jalan)\nLuas atap: 8400 m2 (orientasi Timur-Barat)\nJumlah shift: 3","docType":"sld","fileName":"sld_diagram.txt"}'
```

**Expected Response:**
```json
{
  "success": true,
  "documentId": "...",
  "extracted": {
    "trafoKva": 1600,
    "installedKw": 1110,
    "peakKw": 1153,
    "nightBaseKw": 380,
    "roofM2": 8400,
    "shifts": 3
  },
  "message": "sld extracted and saved successfully"
}
```

---

## Test 4: Get Session with Extracted Plant Data

```bash
curl http://localhost:3000/sessions/{SESSION_ID}
```

**Expected Response:**
```json
{
  "session": {
    "id": "{SESSION_ID}",
    "client_name": "PT Surya Manufacturing",
    "created_at": 1783824528615,
    "updated_at": 1783824528615,
    "status": "active"
  },
  "plant": {
    "id": "...",
    "session_id": "{SESSION_ID}",
    "name": "Extracted Plant Data",
    "tariff": "I-3/TM",
    "lwbp_rate": 1122,
    "wbp_rate": 1683,
    "kwh_lwbp": 245650,
    "kwh_wbp": 61450,
    "kwh_total": 307100,
    "bill_month": 441498840,
    "kva_charge": 49600000,
    "kva_max": 1240,
    "trafo_kva": 1600,
    "installed_kw": 1110,
    "peak_kw": 1153,
    "night_base_kw": 380,
    "roof_m2": 8400,
    "shifts": 3,
    "wbp_start": 18,
    "wbp_end": 22,
    "extracted_at": 1783824614478
  },
  "scenarios": []
}
```

✅ **Verify: Plant data sudah auto-populate dari extracted documents!**

---

## Test 5: List Documents

```bash
curl http://localhost:3000/api/documents/{SESSION_ID}
```

**Expected Response:**
```json
{
  "documents": [
    {
      "id": "...",
      "file_name": "bill_june2026.txt",
      "doc_type": "bill",
      "uploaded_at": 1783824600000,
      "extraction_status": "completed"
    },
    {
      "id": "...",
      "file_name": "sld_diagram.txt",
      "doc_type": "sld",
      "uploaded_at": 1783824614478,
      "extraction_status": "completed"
    }
  ]
}
```

---

## Test 6: Create Scenario (dari extracted data)

```bash
curl -X POST http://localhost:3000/sessions/{SESSION_ID}/scenarios \
  -H "Content-Type: application/json" \
  -d '{"name":"PV 750kWp + BESS 1500kWh","pvCapacityKwp":750,"bessCapacityKwh":1500,"roofUsedM2":6000,"bessCostPerKwh":3800000,"isActive":true}'
```

**Expected Response:**
```json
{
  "id": "...",
  "name": "PV 750kWp + BESS 1500kWh",
  "createdAt": 1783824700000
}
```

---

## Test 7: Verify Full Session Data

```bash
curl http://localhost:3000/sessions/{SESSION_ID}
```

✅ **Verify semua data:**
- Plant dari extracted documents
- Scenarios yang dibuat
- Session metadata

---

## Database Access

Buka Drizzle Studio di terminal baru:
```bash
bun drizzle-kit studio
```

Browser: **https://local.drizzle.studio**

Inspect tables:
- `sessions` — sesi yang dibuat
- `plants` — data yang di-extract
- `documents` — file metadata
- `scenarios` — konfigurasi

---

## Test Checklist

- [ ] Test 1: Session created ✓
- [ ] Test 2: Bill extraction works ✓
- [ ] Test 3: SLD extraction works ✓
- [ ] Test 4: Plant data auto-populated ✓
- [ ] Test 5: Documents listed ✓
- [ ] Test 6: Scenarios saved ✓
- [ ] Test 7: Full data verified ✓
- [ ] Drizzle Studio shows all records ✓

---

## Troubleshooting

**"Bad Request"?**
- Check JSON format (use single quotes for outer, double inside)
- Keep file content without newlines or escape them

**"No such table"?**
- Restart server (database auto-init)

**"Claude extraction failed"?**
- Check SUMOPOD_API_KEY in .env
- Verify internet connection

---

## Next Steps

After testing, run Fase 4 (Frontend integration & UI updates)
