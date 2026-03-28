const mongoose = require("mongoose");

const timetableItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Sun
    subject: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true }, // HH:mm
    endTime: { type: String, required: true, trim: true }, // HH:mm
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

timetableItemSchema.index({ userId: 1, dayOfWeek: 1 });

module.exports = mongoose.model("TimetableItem", timetableItemSchema);

