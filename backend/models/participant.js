import mongoose from "mongoose";
const { Schema } = mongoose;

const sessionParticipantSchema = new Schema({
  session_id: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["teacher", "learner"], required: true },
  joined_at: { type: Date, default: Date.now }
});

export default mongoose.model("SessionParticipant", sessionParticipantSchema);
