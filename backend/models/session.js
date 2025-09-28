import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, required: true },
  capacity: { type: Number, default: 1 },
  twilio_room_sid: { type: String }, // Twilio room identifier
  video_room_url: { type: String },  // link for frontend to join
  scheduled_at: { type: Date, default: Date.now },
  ai_summary: { type: String }, // AI-generated summary
  transcript: { type: String } // raw transcript for summary
});

export default mongoose.model("Session", SessionSchema);
