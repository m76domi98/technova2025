import express from "express";
import Message from "../models/message.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

router.get("/session/:sessionId", async (req, res) => {
  const msgs = await Message.find({ session_id: req.params.sessionId });
  res.json(msgs);
});

export default router;
