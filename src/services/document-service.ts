/**
 * Document Service — Handle file upload & extraction
 * Fase 3: Implement PDF parsing & AI extraction
 */

export async function extractDocumentData(fileBuffer: Buffer, docType: 'bill' | 'sld'): Promise<any> {
  // TODO Fase 3: Parse PDF, extract structured data via AI
  return {
    status: 'pending',
    message: 'Document extraction not implemented yet (Fase 3)',
  };
}

export async function validateDocument(fileBuffer: Buffer, docType: 'bill' | 'sld'): Promise<boolean> {
  // TODO Fase 3: Validate PDF format & content
  return true;
}
