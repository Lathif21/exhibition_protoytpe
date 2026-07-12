import { Elysia } from 'elysia';
import { db } from './src/db';
import 'dotenv/config';

const app = new Elysia();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SUMOPOD_API_KEY;

if (!API_KEY) {
  console.error('ERROR: SUMOPOD_API_KEY not set in .env file');
  process.exit(1);
}

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

// AI endpoint — Claude via SumoPod
app.post('/api/claude', async (req) => {
  try {
    const { messages, model = 'claude-opus-4-8' } = await req.json() as any;

    if (!messages || !Array.isArray(messages)) {
      return { error: 'Invalid request: messages array required' };
    }

    const response = await fetch('https://ai.sumopod.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages,
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error('Claude API error:', data);
      return { error: data.error?.message || 'Claude API error' };
    }

    const text = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim();

    return { text };
  } catch (error: any) {
    console.error('Server error:', error);
    return { error: error.message };
  }
});

// AI endpoint — OpenAI via SumoPod
app.post('/api/openai', async (req) => {
  try {
    const { messages, model = 'gpt-4o-mini' } = await req.json() as any;

    if (!messages || !Array.isArray(messages)) {
      return { error: 'Invalid request: messages array required' };
    }

    const response = await fetch('https://ai.sumopod.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages,
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return { error: data.error?.message || 'OpenAI API error' };
    }

    const text = data.choices?.[0]?.message?.content || '';
    return { text };
  } catch (error: any) {
    console.error('Server error:', error);
    return { error: error.message };
  }
});

app.listen(PORT, () => {
  console.log(`✓ Server berjalan di http://localhost:${PORT}`);
  console.log(`✓ Claude endpoint: POST http://localhost:${PORT}/api/claude`);
  console.log(`✓ OpenAI endpoint: POST http://localhost:${PORT}/api/openai`);
  console.log(`✓ Via SumoPod: https://ai.sumopod.com/v1`);
  console.log(`✓ Database: ${process.env.DATABASE_URL || './local.db'}`);
});

export default app;
