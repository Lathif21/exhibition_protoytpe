const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SUMOPOD_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

if (!API_KEY) {
  console.error('ERROR: SUMOPOD_API_KEY not set in .env file');
  process.exit(1);
}

// Initialize SumoPod client (supports both Claude & OpenAI)
const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: 'https://ai.sumopod.com/v1'
});

app.post('/api/claude', async (req, res) => {
  try {
    const { messages, model = 'claude-opus-4-8' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const response = await client.messages.create({
      model: model,
      max_tokens: 1000,
      messages: messages
    });

    const text = (response.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    res.json({ text });
  } catch (error) {
    console.error('Claude API error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/openai', async (req, res) => {
  try {
    const { messages, model = 'gpt-4o-mini' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const response = await client.chat.completions.create({
      model: model,
      max_tokens: 1000,
      messages: messages
    });

    const text = response.choices[0]?.message?.content || '';

    res.json({ text });
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Server berjalan di http://localhost:${PORT}`);
  console.log(`✓ Claude endpoint: POST http://localhost:${PORT}/api/claude`);
  console.log(`✓ OpenAI endpoint: POST http://localhost:${PORT}/api/openai`);
  console.log(`✓ Via SumoPod: https://ai.sumopod.com/v1`);
});
