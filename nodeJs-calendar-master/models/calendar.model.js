import mongoose from "mongoose";

const calendarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true }, // userId
  color: { type: String, default: "#3b82f6" },
  isShared: { type: Boolean, default: false },
  shareToken: { type: String, unique: true, sparse: true }, // uuid when shared
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Calendar", calendarSchema);
