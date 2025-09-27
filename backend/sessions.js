// session.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const sessionSchema = new Schema({
  teacher_id: { type: Schema.Types.ObjectId, ref: "User" }, // reference to User
  skill: String,
  capacity: { type: Number, default: 1 },
  video_room_url: String, // Daily/Twilio/Agora link
  status: { type: String, default: "open" }, // open / full / completed
  scheduled_at: Date,
  created_at: { type: Date, default: Date.now }
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
