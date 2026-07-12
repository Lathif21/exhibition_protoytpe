import { Elysia } from 'elysia';
import { initializeDatabase } from './src/db/init';
import { aiRoutes } from './src/routes/ai';
import { sessionsRoutes } from './src/routes/sessions';
import { documentRoutes } from './src/routes/documents';
import 'dotenv/config';

const app = new Elysia();
const PORT = process.env.PORT || 3000;

// Initialize database
await initializeDatabase();

// Serve index.html
app.get('/', async () => {
  try {
    const file = Bun.file('./index.html');
    return new Response(file, { headers: { 'Content-Type': 'text/html' } });
  } catch {
    return { error: 'index.html not found' };
  }
});

// Health check
app.get('/health', () => ({ status: 'ok' }));

// Routes
aiRoutes(app);
sessionsRoutes(app);
documentRoutes(app);

app.listen(PORT, () => {
  console.log(`✓ Server berjalan di http://localhost:${PORT}`);
  console.log(`✓ Endpoints:`);
  console.log(`   - AI: POST /api/claude (claude-opus-4-8), /api/openai (gpt-4o-mini)`);
  console.log(`   - Sessions: GET/POST /sessions`);
  console.log(`   - Documents: POST /api/documents (Fase 3)`);
  console.log(`✓ Database: ${process.env.DATABASE_URL || './local.db'}`);
});

export default app;
