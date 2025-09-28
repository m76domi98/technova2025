import { GoogleGenAI } from "@google/genai";

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    
    if (this.apiKey) {
      this.genAI = new GoogleGenAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  /**
   * Check if Gemini API is available
   */
  isAvailable() {
    return this.apiKey && this.genAI && this.model;
  }

  /**
   * Generate intelligent match explanations using Gemini
   * @param {Object} currentUser - Current user with skills_offered and skills_requested
   * @param {Array} matches - Array of matched users
   * @returns {Promise<string>} Gemini-generated explanation
   */
  async generateMatchExplanation(currentUser, matches) {
    if (!this.isAvailable()) {
      throw new Error("Gemini API is not available");
    }

    try {
      const prompt = this.buildMatchPrompt(currentUser, matches);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate match explanation");
    }
  }

  /**
   * Build the prompt for Gemini to analyze matches
   */
  buildMatchPrompt(currentUser, matches) {
    const currentUserSkills = {
      offered: currentUser.skills_offered || [],
      requested: currentUser.skills_requested || []
    };

    const matchesInfo = matches.map((match, index) => {
      return `Match ${index + 1}: ${match.name}
- Skills Offered: ${(match.skills_offered || []).join(', ')}
- Skills Requested: ${(match.skills_requested || []).join(', ')}`;
    }).join('\n\n');

    return `You are an AI assistant for SkillLink, a skill-exchange platform. Analyze the following user and their potential matches to provide intelligent insights.

CURRENT USER:
- Name: ${currentUser.name}
- Skills Offered: ${currentUserSkills.offered.join(', ')}
- Skills Requested: ${currentUserSkills.requested.join(', ')}

POTENTIAL MATCHES:
${matchesInfo}

Please provide a comprehensive analysis (2-3 paragraphs) explaining:
1. Why these matches are particularly good for skill exchange
2. What specific skills align between the current user and each match
3. The mutual benefit potential of these connections
4. Any complementary skills that could lead to valuable exchanges

Focus on practical skill exchange opportunities and mutual learning potential. Be encouraging and highlight the value of these connections.`;
  }

  /**
   * Fallback keyword matching when Gemini is unavailable
   * @param {Object} currentUser - Current user
   * @param {Array} allUsers - All users in database
   * @returns {Array} Top 3 matches with basic keyword intersection
   */
  fallbackKeywordMatch(currentUser, allUsers) {
    const currentUserOffered = (currentUser.skills_offered || []).map(skill => skill.toLowerCase());
    const currentUserRequested = (currentUser.skills_requested || []).map(skill => skill.toLowerCase());

    const matches = allUsers
      .filter(user => user._id.toString() !== currentUser._id.toString())
      .map(user => {
        const userOffered = (user.skills_offered || []).map(skill => skill.toLowerCase());
        const userRequested = (user.skills_requested || []).map(skill => skill.toLowerCase());

        // Calculate compatibility score
        const offeredToRequested = this.calculateIntersection(userOffered, currentUserRequested);
        const requestedToOffered = this.calculateIntersection(currentUserOffered, userRequested);
        
        const totalScore = offeredToRequested + requestedToOffered;
        const maxPossibleScore = Math.max(currentUserOffered.length, currentUserRequested.length) + 
                                Math.max(userOffered.length, userRequested.length);

        return {
          ...user,
          compatibilityScore: totalScore,
          normalizedScore: maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0,
          matchedSkills: {
            offeredToRequested: this.getIntersection(userOffered, currentUserRequested),
            requestedToOffered: this.getIntersection(currentUserOffered, userRequested)
          }
        };
      })
      .filter(match => match.compatibilityScore > 0)
      .sort((a, b) => b.normalizedScore - a.normalizedScore)
      .slice(0, 3);

    return matches;
  }

  /**
   * Calculate intersection count between two arrays
   */
  calculateIntersection(arr1, arr2) {
    return arr1.filter(item => arr2.includes(item)).length;
  }

  /**
   * Get intersection items between two arrays
   */
  getIntersection(arr1, arr2) {
    return arr1.filter(item => arr2.includes(item));
  }

  /**
   * Generate fallback explanation when Gemini is unavailable
   */
  generateFallbackExplanation(currentUser, matches) {
    if (matches.length === 0) {
      return "No compatible matches found based on skill overlap.";
    }

    const explanation = matches.map((match, index) => {
      const { matchedSkills } = match;
      const offeredMatches = matchedSkills.offeredToRequested.join(', ');
      const requestedMatches = matchedSkills.requestedToOffered.join(', ');
      
      return `Match ${index + 1} (${match.name}): ` +
             `They offer ${offeredMatches || 'skills you need'} and need ${requestedMatches || 'skills you offer'}. ` +
             `Compatibility score: ${(match.normalizedScore * 100).toFixed(1)}%`;
    }).join('\n\n');

    return `Based on skill overlap analysis, here are your top matches:\n\n${explanation}\n\nThese matches were found using keyword matching when AI analysis is unavailable.`;
  }
}

export default new GeminiService();
