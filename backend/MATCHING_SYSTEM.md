# Intelligent Matching System for SkillLink

This document describes the intelligent matching system that uses Google Gemini AI to find the best skill exchange matches between users.

## Overview

The matching system analyzes users' `skills_offered` and `skills_requested` arrays to find compatible matches using AI-powered analysis with fallback to keyword matching.

## Features

- **AI-Powered Matching**: Uses Google Gemini API for intelligent skill compatibility analysis
- **Fallback System**: Falls back to keyword matching when Gemini API is unavailable
- **Comprehensive Explanations**: Provides detailed explanations for why matches are good
- **Error Handling**: Robust error handling for missing users, API failures, and edge cases

## API Endpoint

### POST `/api/match/:userId`

Finds intelligent matches for a specific user.

**Parameters:**
- `userId` (string): The MongoDB ObjectId of the user to find matches for

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response:**
```json
{
  "success": true,
  "currentUser": {
    "userId": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "skills_offered": ["JavaScript", "React", "Node.js"],
    "skills_requested": ["Python", "Machine Learning", "Data Analysis"]
  },
  "matches": [
    {
      "rank": 1,
      "userId": "64a1b2c3d4e5f6789012346",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "skills_offered": ["Python", "Machine Learning", "TensorFlow"],
      "skills_requested": ["JavaScript", "React", "Web Development"],
      "compatibilityScore": 0.85,
      "matchedSkills": {
        "offeredToRequested": ["Python", "Machine Learning"],
        "requestedToOffered": ["JavaScript", "React"]
      }
    }
  ],
  "explanation": "AI-generated explanation of why these matches are good...",
  "matchMethod": "gemini_ai",
  "totalMatches": 3,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Environment Setup

Add the following to your `.env` file:

```env
# Google Gemini API Key for intelligent matching
GEMINI_API_KEY=your_gemini_api_key_here
```

## File Structure

```
backend/
├── services/
│   └── gemini.js          # Gemini AI service for intelligent matching
├── routes/
│   └── match.js           # New intelligent matching route
├── models/
│   └── user.js            # User model with skills arrays
└── server.js              # Updated with new route
```

## How It Works

### 1. Gemini AI Matching (Primary)
- Analyzes skill compatibility using natural language processing
- Generates intelligent explanations for match quality
- Considers context and skill relationships beyond simple keywords

### 2. Keyword Matching (Fallback)
- Calculates skill overlap between users
- Uses intersection of `skills_offered` and `skills_requested` arrays
- Provides compatibility scores based on mutual skill needs

### 3. Hybrid Approach
- Uses keyword matching to get initial candidates
- Applies Gemini AI analysis to top candidates
- Returns best 3 matches with AI-generated explanations

## Error Handling

- **Missing User**:** Returns 404 if userId doesn't exist
- **No Skills Data**:** Returns 400 if user has no skills
- **Gemini API Failure**:** Falls back to keyword matching
- **No Matches**:** Returns empty matches array with explanation

## Testing

Run the test script to verify the system:

```bash
node test-matching.js
```

This will:
1. Connect to your MongoDB database
2. Find a test user
3. Test both keyword and AI matching
4. Display results and explanations

## Dependencies

- `@google/genai`: Google Gemini AI SDK
- `mongoose`: MongoDB ODM
- `express`: Web framework

## Usage Examples

### Finding Matches for a User

```javascript
// POST request to /api/match/64a1b2c3d4e5f6789012345
// Headers: Authorization: Bearer <jwt_token>

// Response includes top 3 matches with AI explanations
```

### Integration with Frontend

```javascript
const findMatches = async (userId) => {
  const response = await fetch(`/api/match/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.matches; // Array of top 3 matches
};
```

## Performance Considerations

- Gemini API calls are cached to avoid repeated requests
- Keyword matching is used as fast fallback
- Database queries are optimized with proper indexing
- Response includes match method for debugging

## Future Enhancements

- Vector embeddings for more sophisticated matching
- Machine learning models for better compatibility scoring
- Real-time matching updates
- Skill difficulty levels and expertise matching
