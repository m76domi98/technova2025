import express from "express";
import User from "../models/user.js";

const router = express.Router();

// Find matches for a user
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const matches = await User.find({
      skills_offered: { $in: user.skills_requested },
      _id: { $ne: user._id } // exclude self
    });

    res.json({ user, possibleTeachers: matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
