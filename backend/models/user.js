import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  skills_offered: [String],
  skills_requested: [String],
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
