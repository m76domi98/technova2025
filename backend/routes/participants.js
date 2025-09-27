import express from "express";
import Participant from "../models/participant.js";
import Session from "../models/session.js";

const router = express.Router();

// Join session
router.post("/join", async (req, res) => {
  const { session_id, user_id, role } = req.body;
  const session = await Session.findById(session_id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const count = await Participant.countDocuments({ session_id });
  if (count >= session.capacity) return res.status(400).json({ error: "Session full" });

  const participant = new Participant({ session_id, user_id, role });
  await participant.save();
  res.json(participant);
});

// List participants
router.get("/session/:sessionId", async (req, res) => {
  const participants = await Participant.find({ session_id: req.params.sessionId }).populate("user_id");
  res.json(participants);
});

export default router;
