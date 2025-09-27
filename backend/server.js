import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./user.js"; // correct path

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.get("/", async(req, res) => {
    console.log("hello");
})

// Example route to add a user
app.get("/add-user", async (req, res) => {
  try {
    const newUser = new User({
      name: "Sam",
      email: "sam@email.com",
      skills_offered: ["JavaScript", "React"],
      skills_requested: ["Node.js"]
    });
    await newUser.save();
    res.send("User added!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
