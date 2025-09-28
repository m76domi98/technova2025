// user.controller.js (or similar file on your backend)

import User from './user.model.js'; // Your Mongoose model
import { GoogleGenAI } from "@google/genai";
// Initialize the Gemini client (from previous step)
const ai = new GoogleGenAI({});

// Function to generate embedding (from the previous answer)
async function getSkillEmbedding(skillDescription) {
    // ... (Use the full implementation from the previous answer) ...
}


/**
 * Finds users whose 'skills_offered_vector' is most similar to 
 * the searching user's 'skills_requested_vector'.
 * * @param {string} currentUserId - The ID of the user searching for a match (User A).
 * @param {number} limit - The maximum number of matches to return.
 * @returns {Promise<Array<Object>>} An array of matching user objects with a similarity score.
 */
async function findBestSkillMatches(currentUserId, limit = 10) {
    try {
        // 1. Get the current user's requested skills vector (the query vector)
        const currentUser = await User.findById(currentUserId).select('skills_requested_vector').lean();
        
        if (!currentUser || !currentUser.skills_requested_vector) {
            throw new Error("User not found or requested skills vector is missing.");
        }
        
        const queryVector = currentUser.skills_requested_vector;

        // 2. Define the Vector Search Aggregation Pipeline
        const aggregationPipeline = [
            {
                // The $vectorSearch stage is what performs the high-speed similarity lookup
                '$vectorSearch': {
                    // This name MUST match the index you created in MongoDB Atlas
                    'index': 'skill_match_index',
                    // The field in the database that holds the vectors to search against
                    'path': 'skills_offered_vector', 
                    // The vector to use for the search (User A's requested vector)
                    'queryVector': queryVector,
                    // The number of close matches to examine before returning the best 'limit'
                    'numCandidates': 50, // Higher number = better accuracy, slower search
                    // The final number of results to return
                    'limit': limit,
                }
            },
            {
                // 3. Project the final fields (including the score)
                '$project': {
                    // Exclude the embedding vectors from the final response to save bandwidth
                    'skills_offered_vector': 0, 
                    'skills_requested_vector': 0, 
                    
                    // Include the essential user info
                    'name': 1,
                    'email': 1,
                    'skills_offered': 1,
                    'skills_requested': 1,
                    
                    // Get the Cosine Similarity Score for ranking
                    'score': { '$meta': 'vectorSearchScore' }
                }
            }
        ];

        // 4. Execute the aggregation pipeline
        // .aggregate() is used because $vectorSearch is an aggregation stage
        const matches = await User.aggregate(aggregationPipeline);

        // Filter out the searching user themselves if they somehow appeared
        const filteredMatches = matches.filter(match => match._id.toString() !== currentUserId.toString());
        
        console.log(`Found ${filteredMatches.length} best matches.`);
        return filteredMatches;

    } catch (error) {
        console.error("Error finding skill matches:", error);
        return [];
    }
}

// --- Example Usage ---
async function demoMatch() {
    // NOTE: Replace 'USER_A_ID' with a valid MongoDB ID from your database
    const sampleUserId = '60c72b2f9b1e8e0015f8a2a0'; 
    const bestMatches = await findBestSkillMatches(sampleUserId);

    if (bestMatches.length > 0) {
        console.log("\n--- Top Matching Users ---");
        bestMatches.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (Score: ${user.score.toFixed(4)})`);
            console.log(`   Offers: ${user.skills_offered.join(', ')}`);
        });
    } else {
        console.log("No matches found or an error occurred.");
    }
}

// demoMatch();