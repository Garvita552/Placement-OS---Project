const express = require("express");
const { requireAuth } = require("../middleware/auth");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
router.use(requireAuth);

function buildPrompt(message) {
  return [
    "You are a helpful placement preparation coach for an engineering student.",
    "Be practical and structured. Suggest action steps for today/this week.",
    "When talking about DSA/aptitude, propose a short plan: what to learn, what to practice, and how to revise.",
    "If the user is anxious, respond with calm motivation and a small next step.",
    "",
    `User message: ${message}`,
  ].join("\n");
}

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildPrompt(message);
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.json({ reply });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "AI request failed." });
  }
});

module.exports = router;

