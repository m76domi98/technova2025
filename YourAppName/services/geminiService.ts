import { GEMINI_API_KEY } from '@env';

export interface UserProfile {
  name: string;
  skills: string[];
  level: string;
  location: string;
  mode: string;
  bio: string;
  experience: string;
  goals: string;
}

export interface PersonalizedContent {
  welcomeMessage: string;
  learningPath: string[];
  personalizedGreeting: string;
}

class GeminiService {
  async generatePersonalizedContent(userProfile: UserProfile): Promise<PersonalizedContent> {
    try {
      const prompt = `
        Based on the following user profile, generate personalized content for a mentor matching app:

        User Profile:
        - Name: ${userProfile.name}
        - Skills: ${userProfile.skills.join(', ')}
        - Level: ${userProfile.level}
        - Location: ${userProfile.location}
        - Mode: ${userProfile.mode}
        - Bio: ${userProfile.bio}
        - Experience: ${userProfile.experience}
        - Goals: ${userProfile.goals}

        Please generate:
        1. A personalized welcome message (max 100 characters)
        2. A 3-step learning path tailored to their specific skills, level, and goals. Make it very specific to their chosen skills and experience level.

        Format the response as JSON with these keys:
        {
          "welcomeMessage": "string",
          "learningPath": ["string", "string", "string"],
          "personalizedGreeting": "string"
        }
      `;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
      }

      // Fallback response if JSON parsing fails
      return {
        welcomeMessage: `Welcome to your personalized learning journey, ${userProfile.name}!`,
        learningPath: [
          `Master ${userProfile.skills[0]} fundamentals and core concepts`,
          `Build practical projects combining ${userProfile.skills[0]} and ${userProfile.skills[1]}`,
          `Apply your skills in real-world ${userProfile.goals.toLowerCase()} scenarios`
        ],
        personalizedGreeting: `Welcome, ${userProfile.name}!`
      };

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback content
      return {
        welcomeMessage: `Welcome to your learning journey, ${userProfile.name}!`,
        learningPath: [
          `Master ${userProfile.skills[0]} fundamentals and core concepts`,
          `Build practical projects combining ${userProfile.skills[0]} and ${userProfile.skills[1]}`,
          `Apply your skills in real-world ${userProfile.goals.toLowerCase()} scenarios`
        ],
        personalizedGreeting: `Welcome, ${userProfile.name}!`
      };
    }
  }


  async generateUpcomingClasses(userProfile: UserProfile): Promise<Array<{id: string, title: string, instructor: string, duration: string, level: string, skill: string, time: string, date: string}>> {
    try {
      const prompt = `
        Generate 3 upcoming class suggestions for a mentor matching app based on this user profile:
        
        Skills: ${userProfile.skills.join(', ')}
        Level: ${userProfile.level}
        Goals: ${userProfile.goals}
        Experience: ${userProfile.experience}
        
        Return as a JSON array with this exact format:
        [
          {
            "id": "unique_id",
            "title": "Class Title",
            "instructor": "Instructor Name",
            "duration": "2 hours",
            "level": "Beginner/Intermediate/Expert",
            "skill": "Primary Skill",
            "time": "10:00 AM",
            "date": "Tomorrow"
          }
        ]
      `;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse upcoming classes:', parseError);
      }

      // Fallback upcoming classes based on user's actual skills
      const primarySkill = userProfile.skills[0] || 'Learning';
      const secondarySkill = userProfile.skills[1] || 'Development';
      
      return [
        {
          id: '1',
          title: `${primarySkill} Fundamentals Workshop`,
          instructor: `${primarySkill} Expert`,
          duration: '2 hours',
          level: userProfile.level,
          skill: primarySkill,
          time: '10:00 AM',
          date: 'Tomorrow'
        },
        {
          id: '2',
          title: `${secondarySkill} Advanced Session`,
          instructor: `${secondarySkill} Mentor`,
          duration: '1.5 hours',
          level: userProfile.level,
          skill: secondarySkill,
          time: '2:00 PM',
          date: 'Friday'
        },
        {
          id: '3',
          title: `${primarySkill} Project Workshop`,
          instructor: `${primarySkill} Specialist`,
          duration: '3 hours',
          level: userProfile.level,
          skill: primarySkill,
          time: '9:00 AM',
          date: 'Next Week'
        }
      ];
    } catch (error) {
      console.error('Upcoming classes error:', error);
      const primarySkill = userProfile.skills[0] || 'Learning';
      const secondarySkill = userProfile.skills[1] || 'Development';
      
      return [
        {
          id: '1',
          title: `${primarySkill} Fundamentals Workshop`,
          instructor: `${primarySkill} Expert`,
          duration: '2 hours',
          level: userProfile.level,
          skill: primarySkill,
          time: '10:00 AM',
          date: 'Tomorrow'
        },
        {
          id: '2',
          title: `${secondarySkill} Advanced Session`,
          instructor: `${secondarySkill} Mentor`,
          duration: '1.5 hours',
          level: userProfile.level,
          skill: secondarySkill,
          time: '2:00 PM',
          date: 'Friday'
        },
        {
          id: '3',
          title: `${primarySkill} Project Workshop`,
          instructor: `${primarySkill} Specialist`,
          duration: '3 hours',
          level: userProfile.level,
          skill: primarySkill,
          time: '9:00 AM',
          date: 'Next Week'
        }
      ];
    }
  }

  async generateMentorResponse(userMessage: string, mentorSkill: string, userContext: { name: string, skills: string[], level: string }): Promise<string> {
    try {
      const prompt = `
        You are a professional mentor and expert in ${mentorSkill} with years of teaching experience. You are having a conversation with ${userContext.name}, a ${userContext.level} level student who wants to learn ${userContext.skills.join(', ')}.

        Student's message: "${userMessage}"

        Respond as their mentor with:
        1. Professional, expert advice specific to ${mentorSkill}
        2. Address their question directly with actionable guidance
        3. Consider their ${userContext.level} level - adjust complexity accordingly
        4. Be encouraging but realistic about learning timelines
        5. If they ask about scheduling a lesson, offer to help them book a session
        6. Keep responses conversational but professional (2-4 sentences)
        7. Show your expertise in ${mentorSkill} through specific, helpful advice

        Respond as a real mentor would - knowledgeable, supportive, and focused on their success.
      `;

      console.log('Sending request to Gemini API...');
      console.log('Prompt:', prompt);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      console.log('Gemini API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API response data:', data);
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Extracted text from response:', text);
      
      // Clean up the response
      const cleanResponse = text.trim().replace(/^["']|["']$/g, '');
      
      if (cleanResponse && cleanResponse.length > 10) {
        console.log('Returning clean response:', cleanResponse);
        return cleanResponse;
      }

      // Fallback response if API fails
      console.log('Using fallback response');
      return `That's a great question about ${mentorSkill}! Let me help you with that. Based on your ${userContext.level} level, I'd recommend focusing on the fundamentals first. What specific aspect would you like to explore further?`;

    } catch (error) {
      console.error('Mentor response error:', error);
      
      // Fallback response
      return `That's a great question about ${mentorSkill}! Let me help you with that. Based on your ${userContext.level} level, I'd recommend focusing on the fundamentals first. What specific aspect would you like to explore further?`;
    }
  }

  async generateSkillBasedClasses(userProfile: UserProfile): Promise<Array<{id: string, title: string, instructor: string, duration: string, level: string, skill: string}>> {
    try {
      const prompt = `
        Generate 5 personalized class suggestions for a mentor matching app based on this user profile:
        
        User's Chosen Skills: ${userProfile.skills.join(', ')}
        User's Level: ${userProfile.level}
        User's Goals: ${userProfile.goals}
        User's Experience: ${userProfile.experience}
        
        IMPORTANT: Generate classes that are specifically related to the user's chosen skills: ${userProfile.skills.join(', ')}. 
        Do NOT generate generic tech classes if the user chose non-tech skills like cooking, painting, gardening, etc.
        
        For each skill the user chose, create relevant classes. For example:
        - If user chose "Cooking", create cooking classes
        - If user chose "Painting", create art classes  
        - If user chose "Gardening", create gardening classes
        - If user chose "JavaScript", create programming classes
        
        Return as a JSON array with this exact format:
        [
          {
            "id": "unique_id",
            "title": "Class Title Related to User's Skills",
            "instructor": "Instructor Name",
            "duration": "2 hours",
            "level": "Beginner/Intermediate/Expert",
            "skill": "User's Actual Skill"
          }
        ]
      `;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse skill-based classes:', parseError);
      }

      // Fallback classes based on user's actual skills
      const primarySkill = userProfile.skills[0] || 'Learning';
      const secondarySkill = userProfile.skills[1] || 'Development';
      const thirdSkill = userProfile.skills[2] || 'Growth';
      
      // Generate skill-specific class titles based on the actual skill
      const getSkillSpecificTitle = (skill: string, type: string) => {
        const skillLower = skill.toLowerCase();
        if (skillLower.includes('cooking') || skillLower.includes('culinary')) {
          return type === 'fundamentals' ? 'Basic Cooking Techniques' : 
                 type === 'advanced' ? 'Advanced Culinary Arts' : 
                 type === 'workshop' ? 'Cooking Workshop' : 'Cooking Masterclass';
        } else if (skillLower.includes('painting') || skillLower.includes('art')) {
          return type === 'fundamentals' ? 'Painting Fundamentals' : 
                 type === 'advanced' ? 'Advanced Painting Techniques' : 
                 type === 'workshop' ? 'Art Workshop' : 'Painting Masterclass';
        } else if (skillLower.includes('gardening') || skillLower.includes('plant')) {
          return type === 'fundamentals' ? 'Gardening Basics' : 
                 type === 'advanced' ? 'Advanced Gardening' : 
                 type === 'workshop' ? 'Garden Workshop' : 'Gardening Masterclass';
        } else if (skillLower.includes('javascript') || skillLower.includes('programming')) {
          return type === 'fundamentals' ? 'JavaScript Fundamentals' : 
                 type === 'advanced' ? 'Advanced JavaScript' : 
                 type === 'workshop' ? 'Coding Workshop' : 'JavaScript Masterclass';
        } else {
          return type === 'fundamentals' ? `${skill} Fundamentals` : 
                 type === 'advanced' ? `Advanced ${skill}` : 
                 type === 'workshop' ? `${skill} Workshop` : `${skill} Masterclass`;
        }
      };
      
      return [
        {
          id: '1',
          title: getSkillSpecificTitle(primarySkill, 'fundamentals'),
          instructor: `${primarySkill} Expert`,
          duration: '2 hours',
          level: userProfile.level,
          skill: primarySkill
        },
        {
          id: '2',
          title: getSkillSpecificTitle(secondarySkill, 'advanced'),
          instructor: `${secondarySkill} Mentor`,
          duration: '3 hours',
          level: userProfile.level,
          skill: secondarySkill
        },
        {
          id: '3',
          title: getSkillSpecificTitle(primarySkill, 'workshop'),
          instructor: `${primarySkill} Specialist`,
          duration: '4 hours',
          level: userProfile.level,
          skill: primarySkill
        },
        {
          id: '4',
          title: getSkillSpecificTitle(thirdSkill, 'masterclass'),
          instructor: `${thirdSkill} Professional`,
          duration: '1.5 hours',
          level: 'All Levels',
          skill: thirdSkill
        },
        {
          id: '5',
          title: `${primarySkill} Best Practices`,
          instructor: `${primarySkill} Professional`,
          duration: '2.5 hours',
          level: userProfile.level,
          skill: primarySkill
        }
      ];
    } catch (error) {
      console.error('Skill-based classes error:', error);
      const primarySkill = userProfile.skills[0] || 'Learning';
      const secondarySkill = userProfile.skills[1] || 'Development';
      const thirdSkill = userProfile.skills[2] || 'Growth';
      
      // Generate skill-specific class titles based on the actual skill
      const getSkillSpecificTitle = (skill: string, type: string) => {
        const skillLower = skill.toLowerCase();
        if (skillLower.includes('cooking') || skillLower.includes('culinary')) {
          return type === 'fundamentals' ? 'Basic Cooking Techniques' : 
                 type === 'advanced' ? 'Advanced Culinary Arts' : 
                 type === 'workshop' ? 'Cooking Workshop' : 'Cooking Masterclass';
        } else if (skillLower.includes('painting') || skillLower.includes('art')) {
          return type === 'fundamentals' ? 'Painting Fundamentals' : 
                 type === 'advanced' ? 'Advanced Painting Techniques' : 
                 type === 'workshop' ? 'Art Workshop' : 'Painting Masterclass';
        } else if (skillLower.includes('gardening') || skillLower.includes('plant')) {
          return type === 'fundamentals' ? 'Gardening Basics' : 
                 type === 'advanced' ? 'Advanced Gardening' : 
                 type === 'workshop' ? 'Garden Workshop' : 'Gardening Masterclass';
        } else if (skillLower.includes('javascript') || skillLower.includes('programming')) {
          return type === 'fundamentals' ? 'JavaScript Fundamentals' : 
                 type === 'advanced' ? 'Advanced JavaScript' : 
                 type === 'workshop' ? 'Coding Workshop' : 'JavaScript Masterclass';
        } else {
          return type === 'fundamentals' ? `${skill} Fundamentals` : 
                 type === 'advanced' ? `Advanced ${skill}` : 
                 type === 'workshop' ? `${skill} Workshop` : `${skill} Masterclass`;
        }
      };
      
      return [
        {
          id: '1',
          title: getSkillSpecificTitle(primarySkill, 'fundamentals'),
          instructor: `${primarySkill} Expert`,
          duration: '2 hours',
          level: userProfile.level,
          skill: primarySkill
        },
        {
          id: '2',
          title: getSkillSpecificTitle(secondarySkill, 'advanced'),
          instructor: `${secondarySkill} Mentor`,
          duration: '3 hours',
          level: userProfile.level,
          skill: secondarySkill
        },
        {
          id: '3',
          title: getSkillSpecificTitle(primarySkill, 'workshop'),
          instructor: `${primarySkill} Specialist`,
          duration: '4 hours',
          level: userProfile.level,
          skill: primarySkill
        },
        {
          id: '4',
          title: getSkillSpecificTitle(thirdSkill, 'masterclass'),
          instructor: `${thirdSkill} Professional`,
          duration: '1.5 hours',
          level: 'All Levels',
          skill: thirdSkill
        },
        {
          id: '5',
          title: `${primarySkill} Best Practices`,
          instructor: `${primarySkill} Professional`,
          duration: '2.5 hours',
          level: userProfile.level,
          skill: primarySkill
        }
      ];
    }
  }
}

export default new GeminiService();
