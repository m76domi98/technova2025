import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  // --- EXISTING SKILL FIELDS (Text) ---
  skills_offered: [{ type: String }],
  skills_requested: [{ type: String }],
  
  // --- NEW GEMINI EMBEDDING FIELDS (Vector) ---
  // Store the 768-dimensional vector for skills offered
  skills_offered_vector: {
    type: [Number], // Array of numbers (768 elements)
    index: true,    // Index this field for vector search (crucial for performance)
    required: false, // Not required on initial user creation
  },
  // Store the 768-dimensional vector for skills requested
  skills_requested_vector: {
    type: [Number],
    index: true,
    required: false,
  },
  
  created_at: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", UserSchema);
