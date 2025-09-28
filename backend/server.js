// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Import Routes
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import participantRoutes from './routes/participants.js';
import messageRoutes from './routes/messages.js';
import matchRoutes from './routes/matches.js';
import intelligentMatchRoutes from './routes/match.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware
app.use(cors()); // Enable All CORS Requests
app.use(express.json()); // Body parser for JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// JWT Authentication Middleware (Applies to all protected routes)
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adds the user payload (id) to the request object
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Public Routes (Auth, Login, Search)
app.use('/api/users', userRoutes); // Contains /add-user, /login, and all /search routes

// Protected Routes (Apply `authMiddleware` before protected routes)
// NOTE: I'm making an assumption on which routes should be protected.
// In a real app, most routes besides /login and /add-user should be protected.

// Sessions, Participants, Messages, and Matches often require a logged-in user.
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/participants', authMiddleware, participantRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/matches', authMiddleware, matchRoutes);
app.use('/api/match', authMiddleware, intelligentMatchRoutes);

// Basic Welcome Route
app.get('/', (req, res) => {
  res.send('Skill Share Backend API is Running! 🚀');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});