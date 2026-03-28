const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    content: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Note", noteSchema);

