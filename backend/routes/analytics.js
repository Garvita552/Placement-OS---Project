const express = require("express");
const { requireAuth } = require("../middleware/auth");
const TrackerEntry = require("../models/TrackerEntry");
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

function addDays(isoDate, delta) {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

function buildDateRange(fromISO, toISO) {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  const days = [];
  const step = from <= to ? 1 : -1;
  const cur = new Date(from);
  while ((step === 1 && cur <= to) || (step === -1 && cur >= to)) {
    days.push(toISODate(cur));
    cur.setDate(cur.getDate() + step);
  }
  return days;
}

router.get("/today", async (req, res) => {
  try {
    const { date } = req.query || {};
    const safeDate = date ? toISODate(date) : toISODate(new Date());

    const agg = await TrackerEntry.aggregate([
      { $match: { userId: req.user.id, date: safeDate } },
      { $group: { _id: null, total: { $sum: "$questions" } } },
    ]);

    const total = agg.length ? agg[0].total : 0;
    return res.json({ date: safeDate, totalCompleted: total });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch today summary." });
  }
});

router.get("/range", async (req, res) => {
  try {
    const { from, to } = req.query || {};
    if (!from || !to) return res.status(400).json({ error: "Missing from/to." });

    const fromISO = toISODate(from);
    const toISO = toISODate(to);
    const dates = buildDateRange(fromISO, toISO);

    const rows = await TrackerEntry.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $in: dates },
        },
      },
      {
        $group: {
          _id: "$date",
          total: { $sum: "$questions" },
        },
      },
    ]);

    const map = new Map(rows.map((r) => [r._id, r.total]));
    const points = dates.map((d) => ({ date: d, totalCompleted: map.get(d) || 0 }));

    return res.json({ points });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch analytics range." });
  }
});

router.get("/streak", async (req, res) => {
  try {
    const latest = await TrackerEntry.find({ userId: req.user.id }).sort({ date: -1 }).limit(1).select("date");
    if (!latest.length) {
      return res.json({ currentStreakDays: 0, bestStreakDays: 0, streakDates: [] });
    }

    const latestDate = latest[0].date;

    // Get all distinct dates with entries, for this user.
    const distinctDates = await TrackerEntry.distinct("date", { userId: req.user.id });
    const set = new Set(distinctDates);

    // Current streak: count backwards from latestDate while we have entries.
    let current = 0;
    let curISO = latestDate;
    const streakDates = [];
    while (set.has(curISO)) {
      current += 1;
      streakDates.push(curISO);
      curISO = addDays(curISO, -1);
    }

    // Best streak: scan all dates in chronological order.
    const ordered = distinctDates.slice().sort(); // ISO strings sort lexicographically
    let best = 0;
    let temp = 0;
    let prev = null;
    for (const d of ordered) {
      if (prev === null) {
        temp = 1;
      } else {
        // prev + 1 day?
        const expected = addDays(prev, 1);
        temp = d === expected ? temp + 1 : 1;
      }
      best = Math.max(best, temp);
      prev = d;
    }

    return res.json({ currentStreakDays: current, bestStreakDays: best, streakDates });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to compute streak." });
  }
});

router.get("/weak-topics", async (req, res) => {
  try {
    const days = Math.max(1, Number(req.query.days || 7));
    const limit = Math.max(1, Number(req.query.limit || 6));

    const endISO = toISODate(new Date());
    const startISO = addDays(endISO, -(days - 1));
    const dates = buildDateRange(startISO, endISO);

    const trackerEntries = await TrackerEntry.find(
      { userId: req.user.id, date: { $in: dates } },
      { section: 1, topic: 1, questions: 1, date: 1 }
    );

    const planEntries = await PlanEntry.find(
      { userId: req.user.id, date: { $in: dates } },
      { section: 1, topic: 1, plannedQuestions: 1, date: 1 }
    );

    const key = (s, t) => `${s}|||${t}`;
    const completedMap = new Map();
    for (const e of trackerEntries) {
      const k = key(e.section, e.topic);
      completedMap.set(k, (completedMap.get(k) || 0) + e.questions);
    }

    const plannedMap = new Map();
    for (const p of planEntries) {
      const k = key(p.section, p.topic);
      plannedMap.set(k, (plannedMap.get(k) || 0) + p.plannedQuestions);
    }

    const allKeys = new Set([...completedMap.keys(), ...plannedMap.keys()]);
    const items = [];

    for (const k of allKeys) {
      const [section, topic] = k.split("|||");
      const totalCompleted = completedMap.get(k) || 0;
      const totalPlanned = plannedMap.get(k) || 0;
      const completionRate = totalPlanned > 0 ? totalCompleted / totalPlanned : 0;
      items.push({ section, topic, totalCompleted, totalPlanned, completionRate });
    }

    // Weak = low completion rate; if nothing planned, push lower completed first.
    items.sort((a, b) => {
      const aScore = a.totalPlanned > 0 ? a.completionRate : a.totalCompleted === 0 ? 1 : 0.95;
      const bScore = b.totalPlanned > 0 ? b.completionRate : b.totalCompleted === 0 ? 1 : 0.95;
      // We want smallest completion rate first; for unplanned, treat as medium-ish.
      if (a.totalPlanned > 0 && b.totalPlanned > 0) return aScore - bScore;
      if (a.totalPlanned > 0 && b.totalPlanned === 0) return -1;
      if (a.totalPlanned === 0 && b.totalPlanned > 0) return 1;
      return a.totalCompleted - b.totalCompleted;
    });

    return res.json({ items: items.slice(0, limit) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch weak topics." });
  }
});

module.exports = router;

