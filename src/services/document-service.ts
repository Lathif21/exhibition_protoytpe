import { callClaude } from './ai-service';

/**
 * Extract structured data dari dokumen (PDF or text)
 * Gunakan Claude untuk OCR & parsing
 */
export async function extractDocumentData(
  fileContent: string,
  docType: 'bill' | 'sld'
): Promise<{
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}> {
  try {
    if (docType === 'bill') {
      return await extractBillData(fileContent);
    } else if (docType === 'sld') {
      return await extractSLDData(fileContent);
    }
    return { success: false, error: 'Unknown document type' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Extract data dari rekening listrik (PLN bill)
 */
async function extractBillData(
  content: string
): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
  const prompt = `Anda adalah ahli ekstraksi data dari rekening listrik PLN (tagihan bulanan).

Dari text/content berikut, ekstrak informasi berikut dalam format JSON:
{
  "tariff": "golongan tarif (misal I-3/TM, R1, B2, etc)",
  "lwbpRate": "tarif LWBP dalam Rp/kWh (angka saja)",
  "wbpRate": "tarif WBP/puncak dalam Rp/kWh (angka saja)",
  "kwhLwbp": "pemakaian LWBP bulan ini dalam kWh (angka saja)",
  "kwhWbp": "pemakaian WBP/puncak bulan ini dalam kWh (angka saja)",
  "billMonth": "total tagihan bulan ini dalam Rp (angka saja)",
  "kvaCharge": "biaya beban per kVA per bulan dalam Rp (angka saja)",
  "kvaMax": "kVA daya terukur bulan ini (angka saja)"
}

Jika ada field yang tidak ditemukan, set nilainya null.
Hanya return JSON, tanpa penjelasan tambahan.

Content:
${content}`;

  const response = await callClaude([
    {
      role: 'user',
      content: prompt,
    },
  ]);

  if (!response) {
    return { success: false, error: 'Claude extraction failed' };
  }

  try {
    // Parse JSON dari response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Could not parse JSON from response' };
    }

    const data = JSON.parse(jsonMatch[0]);

    // Convert string numbers to actual numbers
    const extracted = {
      tariff: data.tariff || null,
      lwbpRate: data.lwbpRate ? parseFloat(data.lwbpRate) : null,
      wbpRate: data.wbpRate ? parseFloat(data.wbpRate) : null,
      kwhLwbp: data.kwhLwbp ? parseFloat(data.kwhLwbp) : null,
      kwhWbp: data.kwhWbp ? parseFloat(data.kwhWbp) : null,
      billMonth: data.billMonth ? parseFloat(data.billMonth) : null,
      kvaCharge: data.kvaCharge ? parseFloat(data.kvaCharge) : null,
      kvaMax: data.kvaMax ? parseFloat(data.kvaMax) : null,
    };

    return { success: true, data: extracted };
  } catch (error: any) {
    return { success: false, error: `JSON parse failed: ${error.message}` };
  }
}

/**
 * Extract data dari Single Line Diagram (SLD)
 */
async function extractSLDData(
  content: string
): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
  const prompt = `Anda adalah ahli analisis single line diagram listrik.

Dari text/content berikut, ekstrak informasi teknis dalam format JSON:
{
  "trafoKva": "kapasitas trafo utama dalam kVA (angka saja)",
  "installedKw": "beban terpasang total dalam kW (angka saja)",
  "peakKw": "beban puncak dalam kW (angka saja)",
  "nightBaseKw": "beban dasar malam/shift-3 dalam kW (angka saja)",
  "roofM2": "luas atap tersedia dalam m² (angka saja)",
  "shifts": "jumlah shift operasi (1, 2, atau 3)"
}

Jika ada field yang tidak ditemukan, set nilainya null.
Hanya return JSON, tanpa penjelasan tambahan.

Content:
${content}`;

  const response = await callClaude([
    {
      role: 'user',
      content: prompt,
    },
  ]);

  if (!response) {
    return { success: false, error: 'Claude extraction failed' };
  }

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Could not parse JSON from response' };
    }

    const data = JSON.parse(jsonMatch[0]);

    const extracted = {
      trafoKva: data.trafoKva ? parseFloat(data.trafoKva) : null,
      installedKw: data.installedKw ? parseFloat(data.installedKw) : null,
      peakKw: data.peakKw ? parseFloat(data.peakKw) : null,
      nightBaseKw: data.nightBaseKw ? parseFloat(data.nightBaseKw) : null,
      roofM2: data.roofM2 ? parseFloat(data.roofM2) : null,
      shifts: data.shifts ? parseInt(data.shifts) : null,
    };

    return { success: true, data: extracted };
  } catch (error: any) {
    return { success: false, error: `JSON parse failed: ${error.message}` };
  }
}
