const mongoose = require("mongoose");

const planEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    section: { type: String, required: true, index: true, trim: true },
    topic: { type: String, required: true, index: true, trim: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    plannedQuestions: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

planEntrySchema.index({ userId: 1, section: 1, topic: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("PlanEntry", planEntrySchema);

