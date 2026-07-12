const API_KEY = process.env.SUMOPOD_API_KEY;

if (!API_KEY) {
  console.error('ERROR: SUMOPOD_API_KEY not set in .env file');
  process.exit(1);
}

export async function callClaude(messages: any[], model = 'claude-opus-4-8'): Promise<string | null> {
  try {
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
      const errorMsg = data.error?.message || data.message || 'Unknown error';
      console.error(`[Claude API Error] ${response.status}: ${errorMsg}`);
      return null;
    }

    const text = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim();

    if (!text) {
      console.warn('[Claude] Empty response from API');
      return null;
    }

    return text;
  } catch (error: any) {
    console.error(`[Claude Network Error] ${error.message}`);
    return null;
  }
}

export async function callOpenAI(messages: any[], model = 'gemini/gemini-2.5-flash'): Promise<string | null> {
  try {
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
      const errorMsg = data.error?.message || data.message || 'Unknown error';
      console.error(`[OpenAI API Error] ${response.status}: ${errorMsg}`);
      return null;
    }

    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      console.warn('[OpenAI] Empty response from API');
      return null;
    }

    return text;
  } catch (error: any) {
    console.error(`[OpenAI Network Error] ${error.message}`);
    return null;
  }
}
