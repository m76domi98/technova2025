import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for DMs
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Message", MessageSchema);
