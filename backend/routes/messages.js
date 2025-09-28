import express from "express";
import Message from "../models/message.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const {sender_id, text} = req.body; 

    if (!text || !sender_id){
      return res.status(400).json({error: "missing required fields"});
    }

    const message = new Message({sender_id, text});
    await message.save();

    res.json({message: "message sent successfully"});
  }catch(err){
    res.status(500).json({error: err.message});
  }
});

router.get("/session/:sessionId", async (req, res) => {
  const msgs = await Message.find({ session_id: req.params.sessionId });
  res.json(msgs);
});

export default router;
