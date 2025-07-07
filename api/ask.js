// api/ask.js — Vercel serverless function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { question } = req.body;
  if (!question) return res.status(400).json({ text: 'Missing question.' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Missing OpenAI API key.');
    return res.status(500).json({ text: 'Server misconfiguration — API key not set.' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Unexpected OpenAI response:', data);
      return res.status(500).json({ text: 'No valid reply from OpenAI.' });
    }

    res.status(200).json({ text: data.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ text: 'API error — check logs for details.' });
  }
}
