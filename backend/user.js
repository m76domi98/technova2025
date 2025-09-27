import mongoose from "mongoose";
const { Schema } = mongoose;


const userSchema = new mongoose.Schema({
  name: String,
  email: String,    
  skills_offered: [String],
  skills_requested: [String],
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

export default mongoose.model("User", userSchema);
