// Test script for the intelligent matching system
import User from './models/user.js';
import GeminiService from './services/gemini.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testMatchingSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillsDB');
    console.log('Connected to MongoDB');

    // Find a user to test with
    const testUser = await User.findOne().select('name email skills_offered skills_requested');
    
    if (!testUser) {
      console.log('No users found in database. Please add some users first.');
      return;
    }

    console.log(`\nTesting with user: ${testUser.name}`);
    console.log(`Skills offered: ${testUser.skills_offered?.join(', ') || 'None'}`);
    console.log(`Skills requested: ${testUser.skills_requested?.join(', ') || 'None'}`);

    // Test Gemini service availability
    console.log(`\nGemini API available: ${GeminiService.isAvailable()}`);

    // Get all other users
    const otherUsers = await User.find({ _id: { $ne: testUser._id } })
      .select('name email skills_offered skills_requested');

    console.log(`\nFound ${otherUsers.length} other users in database`);

    if (otherUsers.length === 0) {
      console.log('No other users found. Please add more users to test matching.');
      return;
    }

    // Test fallback keyword matching
    console.log('\n--- Testing Keyword Matching ---');
    const keywordMatches = GeminiService.fallbackKeywordMatch(testUser, otherUsers);
    
    console.log(`Found ${keywordMatches.length} keyword matches:`);
    keywordMatches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.name} (Score: ${match.normalizedScore?.toFixed(3) || 'N/A'})`);
      if (match.matchedSkills) {
        console.log(`   - They offer what you need: ${match.matchedSkills.offeredToRequested.join(', ') || 'None'}`);
        console.log(`   - They need what you offer: ${match.matchedSkills.requestedToOffered.join(', ') || 'None'}`);
      }
    });

    // Test Gemini explanation if available
    if (GeminiService.isAvailable() && keywordMatches.length > 0) {
      console.log('\n--- Testing Gemini AI Explanation ---');
      try {
        const topMatches = keywordMatches.slice(0, 3);
        const explanation = await GeminiService.generateMatchExplanation(testUser, topMatches);
        console.log('Gemini explanation:');
        console.log(explanation);
      } catch (error) {
        console.log('Gemini explanation failed:', error.message);
      }
    } else {
      console.log('\n--- Using Fallback Explanation ---');
      const fallbackExplanation = GeminiService.generateFallbackExplanation(testUser, keywordMatches);
      console.log(fallbackExplanation);
    }

    console.log('\n✅ Matching system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testMatchingSystem();
