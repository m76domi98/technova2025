import express from "express";
import Session from "../models/session.js";
import User from "../models/user.js";

const router = express.Router();

// Create session
router.post("/add-session", async (req, res) => {
  try {
    const { teacher_id, skill, capacity, video_room_url, scheduled_at } = req.body;

    const teacher = await User.findById(teacher_id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const newSession = new Session({ teacher_id, skill, capacity, video_room_url, scheduled_at });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sessions (with teacher info)
router.get("/find-session", async (req, res) => {
  try {
    const sessions = await Session.find().populate("teacher_id");
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
