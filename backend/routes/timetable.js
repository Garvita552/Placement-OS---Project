const express = require("express");
const { requireAuth } = require("../middleware/auth");
const TimetableItem = require("../models/TimetableItem");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const { dayOfWeek } = req.query || {};

    const filter = { userId: req.user.id };
    if (dayOfWeek !== undefined && dayOfWeek !== null && dayOfWeek !== "") {
      filter.dayOfWeek = Number(dayOfWeek);
    }

    const items = await TimetableItem.find(filter).sort({ dayOfWeek: 1, startTime: 1 });
    return res.json({ items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch timetable." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { dayOfWeek, subject, startTime, endTime, notes } = req.body || {};
    if (dayOfWeek === undefined || subject === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing fields." });
    }

    const item = await TimetableItem.create({
      userId: req.user.id,
      dayOfWeek: Number(dayOfWeek),
      subject: String(subject).trim(),
      startTime: String(startTime).trim(),
      endTime: String(endTime).trim(),
      notes: typeof notes === "string" ? notes : "",
    });

    return res.status(201).json({ item });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to save timetable item." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!id) return res.status(400).json({ error: "Missing id." });

    await TimetableItem.findOneAndDelete({ _id: id, userId: req.user.id });
    return res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to delete timetable item." });
  }
});

module.exports = router;

