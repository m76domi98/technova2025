import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
console.log("supabaseUrl: " + supabaseUrl)
console.log("supabaseKey: " + supabaseKey)
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseKey)

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, Backend is running!");
});

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});