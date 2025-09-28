import express from "express";
import User from "../models/user.js";
import mongoose from "mongoose";

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

//get by name
router.get("/:id", async(req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log("User not found");
      return null;
    }
    console.log("User found:", user);
    res.json(user);
  }catch (err){
    res.status(500).json({error: err.message});
  }
});

//get by skills requested 
router.get("/requested/:skills_requested", async(req, res) => {
  const {skills_requested} = req.params; 

  try {
    const user = await User.findOne({skills_requested : skills_requested});

    if (!user) {
      console.log("User not found");
      return null;
    }
    console.log("User found:", user);
    res.json(user);
  }catch (err){
    res.status(500).json({error: err.message});
  }
});

//get by skills offered 
router.get("/offered/:skills_offered", async(req, res) => {
  const {skills_offered} = req.params; 

  try {
    const user = await User.find({skills_offered : skills_offered});

    if (!user) {
      console.log("User not found");
      return null;
    }
    console.log("User found:", user);
    res.json(user);
  }catch (err){
    res.status(500).json({error: err.message}); 
  }
});

//delete user by username 
router.delete("/delete/:id", async(req, res) => {
  const {id} = req.params; 

  try {
    const deletedUser = await User.findByIdAndDelete({id}); 

    if (!deletedUser){
      return res.status(400).json({error: "User not found"});
    }

    res.json({message: "user deleted successfully", user: deletedUser});
  }catch (err){
    res.status(500).json({error: err.message});
  }
});

//update user by username 
router.patch("/update/:id", async(req, res) => {
  const{id} = req.params; 
  const updates = req.body; 

  if (!id) return res.status(400).json({ error: "id is required" });

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No update data provided" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      (id), 
      updates, 
      {new: true}
    );

    if (!updatedUser){
      return res.status(400).json({error: "no user with this id"});
    }

    res.json({message: "user updated successfully", user: updatedUser});
  }catch(err){
    res.status(500).json({error: err.message});
  }
});

export default router;