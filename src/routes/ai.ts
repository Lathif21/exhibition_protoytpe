import { Elysia } from 'elysia';
import { callClaude, callOpenAI } from '../services/ai-service';

export function aiRoutes(app: Elysia) {
  // POST /api/claude — Claude via SumoPod
  app.post('/api/claude', async ({ body }: { body: any }) => {
    try {
      const { messages, model = 'claude-opus-4-8' } = body;

      if (!messages || !Array.isArray(messages)) {
        return { error: 'Invalid request: messages array required' };
      }

      const text = await callClaude(messages, model);
      return text ? { text } : { error: 'Claude API failed' };
    } catch (error: any) {
      console.error('Server error:', error);
      return { error: error.message };
    }
  });

  // POST /api/openai — OpenAI via SumoPod
  app.post('/api/openai', async ({ body }: { body: any }) => {
    try {
      const { messages, model = 'gemini/gemini-2.5-flash' } = body;

      if (!messages || !Array.isArray(messages)) {
        return { error: 'Invalid request: messages array required' };
      }

      const text = await callOpenAI(messages, model);
      return text ? { text } : { error: 'OpenAI API failed' };
    } catch (error: any) {
      console.error('Server error:', error);
      return { error: error.message };
    }
  });

  return app;
}
