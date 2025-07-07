// api/ask.js — debug version
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { question } = req.body;
  if (!question) return res.status(400).json({ text: 'Missing question' });

  try {
    console.log('🔍 Incoming question:', question);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
        temperature: 0.7
      })
    });

    const raw = await openaiRes.text();
    console.log('🧾 Raw OpenAI response:', raw);

    const data = JSON.parse(raw);
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.log('⚠️ No reply in response');
      return res.status(200).json({ text: "No reply from OpenAI." });
    }

    res.status(200).json({ text });
  } catch (err) {
    console.error("❌ OpenAI API Error:", err);
    res.status(500).json({ text: "API error — see Vercel logs." });
  }
}
