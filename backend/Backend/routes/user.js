import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// --- REGISTER ---
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ user: { id: user._id, name, email }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- UPDATE PROFILE ---
router.put("/profile", async (req, res) => {
  try {
    const { userId, skills, level, location, mode, bio, experience, goals, personalizedContent } = req.body;
    
    console.log('Profile update request:', req.body);
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user profile fields
    if (skills) user.skills = skills;
    if (level) user.level = level;
    if (location) user.location = location;
    if (mode) user.mode = mode;
    if (bio) user.bio = bio;
    if (experience) user.experience = experience;
    if (goals) user.goals = goals;
    if (personalizedContent) user.personalizedContent = personalizedContent;

    await user.save();
    
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// --- GET USER PROFILE ---
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;