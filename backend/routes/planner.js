const express = require("express");
const { requireAuth } = require("../middleware/auth");
const PlanEntry = require("../models/PlanEntry");

const router = express.Router();
router.use(requireAuth);

function toISODate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.get("/plans", async (req, res) => {
  try {
    const { date } = req.query || {};
    const safeDate = date ? toISODate(date) : toISODate(new Date());

    const plans = await PlanEntry.find({ userId: req.user.id, date: safeDate }).sort({
      section: 1,
      topic: 1,
    });

    return res.json({ date: safeDate, plans });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch plans." });
  }
});

// Upsert plannedQuestions for (section, topic, date)
router.post("/plans", async (req, res) => {
  try {
    const { section, topic, date, plannedQuestions } = req.body || {};
    if (!section || !topic) return res.status(400).json({ error: "Missing section/topic." });

    const q = Number(plannedQuestions);
    if (!Number.isFinite(q) || q < 0) return res.status(400).json({ error: "plannedQuestions must be >= 0." });

    const safeDate = date ? toISODate(date) : toISODate(new Date());

    const plan = await PlanEntry.findOneAndUpdate(
      { userId: req.user.id, section: String(section).trim(), topic: String(topic).trim(), date: safeDate },
      { $set: { plannedQuestions: q } },
      { new: true, upsert: true }
    );

    return res.status(201).json({ plan });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to save plan." });
  }
});

router.delete("/plans", async (req, res) => {
  try {
    const { section, topic, date } = req.query || {};
    if (!section || !topic || !date) return res.status(400).json({ error: "Missing params." });

    const safeDate = toISODate(date);

    await PlanEntry.deleteOne({
      userId: req.user.id,
      section: String(section).trim(),
      topic: String(topic).trim(),
      date: safeDate,
    });

    return res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to delete plan." });
  }
});

module.exports = router;

