import express from "express";
import User from "../models/user.js";

const router = express.Router();

// Create user
router.post("/add-user", async (req, res) => {
  try {
    const { name, email, skills_offered, skills_requested } = req.body;
    const newUser = new User({ name, email, skills_offered, skills_requested });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/all-user", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
