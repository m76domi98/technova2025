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

//get sessions by skills offered 
router.get("/skils-offered/:skills_offered", async (req, res) => {
  const {skills_offered} = req.params; 
  try {
    const sessions = await Session.find({skills_offered : skill});
    res.json(sessions);


  }catch (err){
    res.status(500).json({error: err.message});
  }
});


//get sessions by all sessions available 
router.get("/all", async (req, res) => {
  try {

    const sessions = await Session.find();

    if (!sessions){
      res.json("no sessions found");
    }

    res.json(sessions);
  } catch (error) {
    res.status(500).json({error:err.message});
  }
});


export default router;
