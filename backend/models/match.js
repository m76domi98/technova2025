import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  matched_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["liked", "disliked", "matched"], default: "liked" },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Match", MatchSchema);
