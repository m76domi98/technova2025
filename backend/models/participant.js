import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["teacher", "student"], default: "student" },
  joined_at: { type: Date, default: Date.now }
});

export default mongoose.model("Participant", ParticipantSchema);
