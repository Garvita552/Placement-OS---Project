const express = require("express");
const router = express.Router();
const Topic = require("../models/Topic");
const { requireAuth } = require("../middleware/auth");

// GET /api/curriculum?section=X
// If no section provided, returns ALL topics (useful for daily-tracker mapping)
router.get("/", requireAuth, async (req, res) => {
    try {
        const { section } = req.query;
        let query = { $or: [{ userId: null }, { userId: req.user.id }] };
        
        if (section) {
            query.section = section;
        }

        const topics = await Topic.find(query);
        res.json({ topics });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/curriculum
// Add a custom topic for this user
router.post("/", requireAuth, async (req, res) => {
    try {
        const { section, title, summary, highlights, interviewFocus, roadmap, youtube, websites, practice } = req.body;
        if (!section || !title) return res.status(400).json({ error: "Section and title required" });

        const newTopic = new Topic({
            section,
            title,
            summary: summary || "",
            highlights: highlights || [],
            interviewFocus: interviewFocus || [],
            roadmap: roadmap || [],
            youtube: youtube || [],
            websites: websites || [],
            practice: practice || "",
            userId: req.user.id // Custom to this user
        });

        await newTopic.save();
        res.status(201).json({ message: "Topic added successfully", topic: newTopic });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/curriculum/seed
// Receives massive JSON from frontend once to populate the DB global defaults.
router.post("/seed", async (req, res) => {
    try {
        const { curriculumData } = req.body;
        if (!curriculumData) return res.status(400).json({ error: "Missing curriculum data" });

        // Only seed if DB is utterly empty for Topics
        const count = await Topic.countDocuments({ userId: null });
        if (count > 0) {
            return res.status(400).json({ error: "Database already seeded. Clear it first if you want to re-seed." });
        }

        let insertedCount = 0;
        // curriculumData is an object: { "aptitude": { "Numbers..": { highlights: [] } } }
        for (const sectionKey of Object.keys(curriculumData)) {
            const sectionObj = curriculumData[sectionKey];
            
            for (const topicTitle of Object.keys(sectionObj)) {
                const details = sectionObj[topicTitle];
                
                const newTopic = new Topic({
                    section: sectionKey,
                    title: topicTitle,
                    summary: details.summary || "",
                    highlights: details.highlights || [],
                    interviewFocus: details.interviewFocus || [],
                    roadmap: details.roadmap || [],
                    youtube: details.youtube || [],
                    websites: details.websites || [],
                    practice: details.practice || "",
                    userId: null // Global
                });
                await newTopic.save();
                insertedCount++;
            }
        }

        res.json({ message: `Successfully seeded ${insertedCount} global topics!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
