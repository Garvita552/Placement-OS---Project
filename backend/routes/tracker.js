const express = require("express");

const { requireAuth } = require("../middleware/auth");
const TrackerEntry = require("../models/TrackerEntry");

const router = express.Router();

router.use(requireAuth);

function toISODate(d) {
  const date = d instanceof Date ? d : new Date(d);
  // Local date => YYYY-MM-DD for consistent UI matching.
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.get("/entries", async (req, res) => {
  try {
    const { section, topic } = req.query || {};
    if (!section || !topic) return res.status(400).json({ error: "Missing section/topic." });

    const entries = await TrackerEntry.find({
      userId: req.user.id,
      section: String(section).trim(),
      topic: String(topic).trim(),
    }).sort({ date: 1, createdAt: 1 });

    return res.json({ entries });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch entries." });
  }
});

router.post("/entries", async (req, res) => {
  try {
    const { section, topic, date, questions, type } = req.body || {};

    if (!section || !topic) return res.status(400).json({ error: "Missing section/topic." });

    const q = Number(questions);
    if (!Number.isFinite(q) || q <= 0) return res.status(400).json({ error: "questions must be > 0." });

    const safeDate = date ? toISODate(date) : toISODate(new Date());

    const created = await TrackerEntry.create({
      userId: req.user.id,
      section: String(section).trim(),
      topic: String(topic).trim(),
      date: safeDate,
      questions: q,
      type: type || "Practice",
    });

    return res.status(201).json({ entry: created });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to add entry." });
  }
});

router.delete("/entries/:id", async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!id) return res.status(400).json({ error: "Missing entry id." });

    const deleted = await TrackerEntry.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ error: "Entry not found." });
    return res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to delete entry." });
  }
});

router.get("/today-by-topic", async (req, res) => {
  try {
    const { date } = req.query || {};
    const safeDate = date ? toISODate(date) : toISODate(new Date());

    const entries = await TrackerEntry.find(
      { userId: req.user.id, date: safeDate },
      { section: 1, topic: 1, questions: 1 }
    );

    const map = new Map();
    for (const e of entries) {
      const key = `${e.section}|||${e.topic}`;
      map.set(key, (map.get(key) || 0) + e.questions);
    }

    const result = Array.from(map.entries()).map(([k, totalCompleted]) => {
      const [section, topic] = k.split("|||");
      return { section, topic, totalCompleted };
    });

    return res.json({ date: safeDate, items: result });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch today-by-topic." });
  }
});

module.exports = router;

