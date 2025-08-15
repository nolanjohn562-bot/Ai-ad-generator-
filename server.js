import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/generate", async (req, res) => {
  try {
    const { product, audience, tone, platform, length, language, extras, variants } = req.body;

    if (!product) return res.status(400).json({ error: "Product is required" });

    const prompt = `
You are an elite ad copywriter.
Write ${length || "short"} ${platform || "social"} ads in ${language || "English"}.
Product/Offer: ${product}
Audience: ${audience || "general"}
Tone/style: ${tone || "persuasive"}
${extras ? `Extras/constraints: ${extras}` : ""}

Requirements:
- Strong hook in first line
- Concrete benefits and credibility
- Clear CTA tailored to ${platform || "the platform"}
- Include 3-5 hashtags if applicable
`;

    const tasks = Array.from({ length: Math.min(variants || 1, 5) }).map(async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You write high-converting, platform-specific ads." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 400,
      });
      return response.choices[0].message.content.trim();
    });

    const ads = await Promise.all(tasks);
    res.json({ ads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
