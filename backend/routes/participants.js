import express from "express";
import Participant from "../models/participant.js";
import Session from "../models/session.js";
import User from "../models/user.js";

const router = express.Router();

// Join a session
router.post("/join-session", async (req, res) => {
  try {
    const { session_id, user_id, role } = req.body;

    const session = await Session.findById(session_id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const count = await Participant.countDocuments({ session_id, role: "learner" });
    if (role === "learner" && count >= session.capacity) {
      return res.status(400).json({ error: "Session is full" });
    }

    const participant = new Participant({ session_id, user_id, role });
    await participant.save();
    res.status(201).json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get participants for a session
router.get("/:sessionId", async (req, res) => {
  try {
    const participants = await Participant.find({ session_id: req.params.sessionId })
                                         .populate("user_id");
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
