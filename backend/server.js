import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./user.js"; // correct path
import Session from "./sessions.js";
import SessionParticipant from "./session_participants.js";

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.get("/", async(req, res) => {
    console.log("hello");
})

// Example route to add a user
app.post("/add-user", async (req, res) => {
  const { name, email, skills_offered, skills_requested } = req.body;

  console.log("Request Body:", req.body);

  try {
    const newUser = new User({ name, email, skills_offered, skills_requested });
    await newUser.save();
    res.status(201).json({ message: "User added!", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add-session", async (req, res) => {
  const { teacher_id, skill, capacity, video_room_url, status } = req.body;

  console.log("Request Body:", req.body);

  try {
    const newSession = new Session({
      teacher_id,
      skill,
      capacity,
      video_room_url,
      status
    });

    await newSession.save();
    res.status(201).json({ message: "Session created!", session: newSession });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a participant to a session
app.post("/add-participant", async (req, res) => {
  const { session_id, user_id, role } = req.body;

  console.log("Request Body:", req.body);

  try {
    const newParticipant = new SessionParticipant({ session_id, user_id, role });
    await newParticipant.save();
    res.status(201).json({ message: "Participant added!", participant: newParticipant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
