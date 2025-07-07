export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { question } = req.body;
  if (!question) return res.status(400).end('Missing question');

  try {
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

    const data = await openaiRes.json();
    console.log("🧠 OpenAI full response:", JSON.stringify(data, null, 2)); // Add logging for debugging

    if (!data || !data.choices || data.choices.length === 0) {
      return res.status(500).json({ text: "No reply from OpenAI." });
    }

    const text = data.choices[0].message.content;
    res.status(200).json({ text });

  } catch (err) {
    console.error("❌ OpenAI API Error:", err);
    res.status(500).json({ text: "Server error — see Vercel logs." });
  }
}
