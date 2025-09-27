import mongoose from "mongoose";
const { Schema } = mongoose;

const sessionSchema = new Schema({
  skill: {type: String, required: true},
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["teacher", "learner"], required: true },
  joined_at: { type: Date, default: Date.now }
});

export default mongoose.model("Session", sessionSchema);