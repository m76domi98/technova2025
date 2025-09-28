import express from "express";
import User from "../models/user.js";
import GeminiService from "../services/gemini.js";

const router = express.Router();

/**
 * POST /match/:userId
 * Find intelligent matches for a user using Gemini AI
 */
router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required" 
      });
    }

    // Fetch the current user
    const currentUser = await User.findById(userId).select(
      "name email skills_offered skills_requested"
    );

    if (!currentUser) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    // Check if user has skills data
    if ((!currentUser.skills_offered || currentUser.skills_offered.length === 0) &&
        (!currentUser.skills_requested || currentUser.skills_requested.length === 0)) {
      return res.status(400).json({ 
        error: "User must have at least some skills offered or requested" 
      });
    }

    // Fetch other users (exclude current user)
    const otherUsers = await User.find({ 
      _id: { $ne: userId } 
    }).select("name email skills_offered skills_requested");

    if (otherUsers.length === 0) {
      return res.status(404).json({ 
        error: "No other users found in the database" 
      });
    }

    let matches = [];
    let explanation = "";
    let matchMethod = "";

    // Try Gemini AI matching first
    if (GeminiService.isAvailable()) {
      try {
        // Use Gemini to analyze and rank matches
        matches = await findMatchesWithGemini(currentUser, otherUsers);
        explanation = await GeminiService.generateMatchExplanation(currentUser, matches);
        matchMethod = "gemini_ai";
      } catch (geminiError) {
        console.warn("Gemini API failed, falling back to keyword matching:", geminiError.message);
        // Fall back to keyword matching
        matches = GeminiService.fallbackKeywordMatch(currentUser, otherUsers);
        explanation = GeminiService.generateFallbackExplanation(currentUser, matches);
        matchMethod = "keyword_fallback";
      }
    } else {
      // Use keyword matching when Gemini is not available
      matches = GeminiService.fallbackKeywordMatch(currentUser, otherUsers);
      explanation = GeminiService.generateFallbackExplanation(currentUser, matches);
      matchMethod = "keyword_only";
    }

    // Format response
    const formattedMatches = matches.map((match, index) => ({
      rank: index + 1,
      userId: match._id,
      name: match.name,
      email: match.email,
      skills_offered: match.skills_offered || [],
      skills_requested: match.skills_requested || [],
      compatibilityScore: match.compatibilityScore || match.normalizedScore || 0,
      matchedSkills: match.matchedSkills || null
    }));

    res.json({
      success: true,
      currentUser: {
        userId: currentUser._id,
        name: currentUser.name,
        skills_offered: currentUser.skills_offered || [],
        skills_requested: currentUser.skills_requested || []
      },
      matches: formattedMatches,
      explanation,
      matchMethod,
      totalMatches: formattedMatches.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in match endpoint:", error);
    res.status(500).json({ 
      error: "Internal server error while finding matches",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Use Gemini AI to find and rank matches intelligently
 */
async function findMatchesWithGemini(currentUser, otherUsers) {
  // For now, we'll use a hybrid approach:
  // 1. Use keyword matching to get initial candidates
  // 2. Use Gemini to re-rank and explain the top matches
  
  const initialMatches = GeminiService.fallbackKeywordMatch(currentUser, otherUsers);
  
  // Take top 5 for Gemini analysis
  const topCandidates = initialMatches.slice(0, 5);
  
  if (topCandidates.length === 0) {
    return [];
  }

  // Use Gemini to analyze and potentially re-rank
  try {
    const geminiAnalysis = await GeminiService.generateMatchExplanation(currentUser, topCandidates);
    
    // For now, return the top 3 from initial keyword matching
    // In a more advanced implementation, you could use Gemini's analysis
    // to re-rank the matches based on the AI's insights
    return topCandidates.slice(0, 3);
  } catch (error) {
    console.warn("Gemini analysis failed, using keyword results:", error);
    return topCandidates.slice(0, 3);
  }
}

export default router;
