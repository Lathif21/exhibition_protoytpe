import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';
import { extractDocumentData } from '../services/document-service';

const dbPath = process.env.DATABASE_URL || './local.db';

function generateId(): string {
  return crypto.randomUUID();
}

export function documentRoutes(app: Elysia) {
  /**
   * POST /api/documents/:sessionId/upload
   * Upload & extract document (bill or SLD)
   * Body: multipart/form-data with file & docType
   */
  app.post('/api/documents/:sessionId/upload', async ({ params, body }: { params: any; body: any }) => {
    try {
      const sessionId = params.sessionId;
      const db = new Database(dbPath);

      // In Elysia, file upload handling varies. For now, accept base64 or text content
      const { fileContent, docType, fileName } = body as any;

      if (!fileContent || !docType) {
        return { error: 'fileContent and docType required' };
      }

      if (!['bill', 'sld'].includes(docType)) {
        return { error: 'docType must be "bill" or "sld"' };
      }

      const documentId = generateId();
      const uploadedAt = Date.now();

      // Save document metadata
      db.prepare(`
        INSERT INTO documents (id, session_id, file_name, doc_type, uploaded_at, extraction_status)
        VALUES (?, ?, ?, ?, ?, 'processing')
      `).run(documentId, sessionId, fileName || `${docType}_${uploadedAt}`, docType, uploadedAt);

      // Extract data via AI
      const extractResult = await extractDocumentData(fileContent, docType);

      if (!extractResult.success) {
        db.prepare(`
          UPDATE documents SET extraction_status = 'failed' WHERE id = ?
        `).run(documentId);

        return { error: extractResult.error, documentId };
      }

      // Save extracted data
      db.prepare(`
        UPDATE documents
        SET extraction_status = 'completed', extracted_data = ?
        WHERE id = ?
      `).run(JSON.stringify(extractResult.data), documentId);

      // Save to plants table if new, or update if exists
      const existingPlant = db.prepare(`
        SELECT id FROM plants WHERE session_id = ?
      `).get(sessionId);

      const plantData = extractResult.data;
      const now = Date.now();

      if (!existingPlant) {
        const plantId = generateId();
        db.prepare(`
          INSERT INTO plants (
            id, session_id, name, tariff, lwbp_rate, wbp_rate,
            kwh_lwbp, kwh_wbp, kwh_total, bill_month, kva_charge, kva_max,
            trafo_kva, installed_kw, peak_kw, night_base_kw, roof_m2, shifts,
            wbp_start, wbp_end, extracted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          plantId,
          sessionId,
          'Extracted Plant Data',
          plantData.tariff || null,
          plantData.lwbpRate || null,
          plantData.wbpRate || null,
          plantData.kwhLwbp || null,
          plantData.kwhWbp || null,
          (plantData.kwhLwbp || 0) + (plantData.kwhWbp || 0),
          plantData.billMonth || null,
          plantData.kvaCharge || null,
          plantData.kvaMax || null,
          plantData.trafoKva || null,
          plantData.installedKw || null,
          plantData.peakKw || null,
          plantData.nightBaseKw || null,
          plantData.roofM2 || null,
          plantData.shifts || null,
          18, // default WBP start
          22, // default WBP end
          now
        );
      } else {
        // Update existing plant
        db.prepare(`
          UPDATE plants
          SET tariff = COALESCE(?, tariff),
              lwbp_rate = COALESCE(?, lwbp_rate),
              wbp_rate = COALESCE(?, wbp_rate),
              kwh_lwbp = COALESCE(?, kwh_lwbp),
              kwh_wbp = COALESCE(?, kwh_wbp),
              bill_month = COALESCE(?, bill_month),
              kva_charge = COALESCE(?, kva_charge),
              kva_max = COALESCE(?, kva_max),
              trafo_kva = COALESCE(?, trafo_kva),
              installed_kw = COALESCE(?, installed_kw),
              peak_kw = COALESCE(?, peak_kw),
              night_base_kw = COALESCE(?, night_base_kw),
              roof_m2 = COALESCE(?, roof_m2),
              shifts = COALESCE(?, shifts),
              extracted_at = ?
          WHERE session_id = ?
        `).run(
          plantData.tariff,
          plantData.lwbpRate,
          plantData.wbpRate,
          plantData.kwhLwbp,
          plantData.kwhWbp,
          plantData.billMonth,
          plantData.kvaCharge,
          plantData.kvaMax,
          plantData.trafoKva,
          plantData.installedKw,
          plantData.peakKw,
          plantData.nightBaseKw,
          plantData.roofM2,
          plantData.shifts,
          now,
          sessionId
        );
      }

      return {
        success: true,
        documentId,
        extracted: extractResult.data,
        message: `${docType} extracted and saved successfully`,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  /**
   * GET /api/documents/:sessionId
   * List documents for a session
   */
  app.get('/api/documents/:sessionId', async ({ params }: { params: any }) => {
    try {
      const db = new Database(dbPath);
      const documents = db.prepare(`
        SELECT id, file_name, doc_type, uploaded_at, extraction_status
        FROM documents WHERE session_id = ?
        ORDER BY uploaded_at DESC
      `).all(params.sessionId);

      return { documents: documents || [] };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  return app;
}
