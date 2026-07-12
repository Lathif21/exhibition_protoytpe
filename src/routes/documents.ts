import { Elysia } from 'elysia';

/**
 * Document Routes — File upload & extraction
 * Fase 3: Implement document upload, parsing, & AI extraction
 */

export function documentRoutes(app: Elysia) {
  // POST /api/documents/:sessionId — upload document
  app.post('/api/documents/:sessionId', async ({ params, body }: { params: any; body: any }) => {
    // TODO Fase 3: Handle file upload, validate, extract data
    return { error: 'Document upload not implemented yet (Fase 3)' };
  });

  // GET /api/documents/:sessionId — list session documents
  app.get('/api/documents/:sessionId', async ({ params }: { params: any }) => {
    // TODO Fase 3: Fetch documents from database
    return { documents: [] };
  });

  return app;
}
