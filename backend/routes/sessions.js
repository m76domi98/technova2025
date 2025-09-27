import express from "express";
import Session from "../models/session.js";
import { OpenAI } from "openai";
import twilio from "twilio";

const router = express.Router();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Create session + Twilio room
router.post("/add", async (req, res) => {
  try {
    const { teacher_id, skill, capacity } = req.body;
    const room = await client.video.rooms.create({ uniqueName: `room-${Date.now()}` });

    const session = new Session({
      teacher_id,
      skill,
      capacity,
      twilio_room_sid: room.sid,
      video_room_url: `https://video.twilio.com/rooms/${room.sid}`
    });

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// End session + generate summary
router.post("/end/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const { transcript } = req.body;
    session.transcript = transcript;

    // Call Gemini/OpenAI for summary
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "Summarize this tutoring session." }, { role: "user", content: transcript }]
    });

    session.ai_summary = completion.choices[0].message.content;
    await session.save();

    res.json({ summary: session.ai_summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
