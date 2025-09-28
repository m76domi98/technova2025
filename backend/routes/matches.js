import express from "express";
import Match from "../models/match.js";

const router = express.Router();

// Find matches for a user
router.get("/:userId", async (req, res) => {
  const matches = await Match.find({ user_id: req.params.userId });
  res.json(matches);
});

router.post("/swipe/:userId", async (req, res) => {
  const { matched_user_id, status } = req.body;
  const match = new Match({ user_id: req.params.userId, matched_user_id, status });
  await match.save();
  res.json(match);
});

export default router;
