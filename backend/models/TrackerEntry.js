const mongoose = require("mongoose");

const trackerEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    section: { type: String, required: true, index: true, trim: true },
    topic: { type: String, required: true, index: true, trim: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    questions: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      required: true,
      enum: ["Practice", "Revision", "Mock Test"],
      default: "Practice",
    },
  },
  { timestamps: true }
);

trackerEntrySchema.index({ userId: 1, section: 1, topic: 1, date: 1 });

module.exports = mongoose.model("TrackerEntry", trackerEntrySchema);

