import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  skills: [{
    type: String,
    required: true
  }],
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner'
  },
  location: {
    type: String,
    default: 'Remote'
  },
  mode: {
    type: String,
    enum: ['Online', 'In-person', 'Hybrid'],
    default: 'Online'
  },
  avatarColor: {
    type: String,
    default: '#A5B5FF'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  experience: {
    type: String,
    maxlength: 1000
  },
  goals: {
    type: String,
    maxlength: 1000
  },
  personalizedContent: {
    welcomeMessage: String,
    suggestedMentors: [String],
    learningPath: [String],
    dailyTips: [String],
    personalizedGreeting: String
  },
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);
