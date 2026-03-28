const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Note = require("../models/Note");

const router = express.Router();
router.use(requireAuth);

function toISODate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.get("/", async (req, res) => {
  try {
    const { date } = req.query || {};
    const safeDate = date ? toISODate(date) : toISODate(new Date());

    const note = await Note.findOne({ userId: req.user.id, date: safeDate });
    return res.json({ date: safeDate, content: note ? note.content : "" });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch note." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { date, content } = req.body || {};
    const safeDate = date ? toISODate(date) : toISODate(new Date());
    const safeContent = typeof content === "string" ? content : "";

    const note = await Note.findOneAndUpdate(
      { userId: req.user.id, date: safeDate },
      { $set: { content: safeContent } },
      { upsert: true, new: true }
    );

    return res.status(201).json({ date: safeDate, note });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to save note." });
  }
});

module.exports = router;

