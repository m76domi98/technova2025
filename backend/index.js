import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// health check
app.get("/health", (req, res) => res.send("Backend running ✅"));

// example: create user
app.post("/users", async (req, res) => {
  const { name, skills_offered, skills_requested, availability } = req.body;
  const { data, error } = await supabase.from("users").insert([
    { name, skills_offered, skills_requested, availability }
  ]);
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.listen(4000, () => console.log("Backend running on port 4000"));
