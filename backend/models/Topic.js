const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
    section: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    interviewFocus: { type: [String], default: [] },
    roadmap: { type: [String], default: [] },
    youtube: { type: [String], default: [] },
    websites: { type: [String], default: [] },
    practice: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null } // null = Global defaults
}, { timestamps: true });

module.exports = mongoose.model("Topic", topicSchema);
