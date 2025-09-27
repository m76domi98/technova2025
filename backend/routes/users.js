import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Register user
router.post("/add-user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user });
});

// Search by name
router.get("/search/name/:name", async (req, res) => {
  const regex = new RegExp(req.params.name, "i");
  const users = await User.find({ name: regex });
  res.json(users);
});

// Search by offered skill
router.get("/search/offered/:skill", async (req, res) => {
  const users = await User.find({ skills_offered: req.params.skill });
  res.json(users);
});

// Search by requested skill
router.get("/search/requested/:skill", async (req, res) => {
  const users = await User.find({ skills_requested: req.params.skill });
  res.json(users);
});

export default router;
