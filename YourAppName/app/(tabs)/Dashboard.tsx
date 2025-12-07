import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router, useFocusEffect } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/authService';
import GeminiService from '../../services/geminiService';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#7B42F6', // Purple
  secondary: '#A5B5FF', // Lavender
  accent: '#FF6F61', // Coral/Red
  background: '#F9FAFF',
  textDark: '#2D2D2D',
  textLight: '#FFFFFF',
  cardBackground: '#FFFFFF',
  shadowColor: '#000000',
  success: '#4CAF50',
  warning: '#FFC107',
};

type ClassItem = {
  id: string;
  title: string;
  mentor: string;
  time: string;
};

type SkillItem = {
  id: string;
  name: string;
  progress: number;
  icon: string;
};

type SuggestedItem = {
  id: string;
  title: string;
  mentor: string;
  rating: number;
};

const DUMMY_USER = { name: 'Alex' };

const DUMMY_CLASSES: ClassItem[] = [
  { id: '1', title: 'Advanced React Hooks', mentor: 'Jane Doe', time: 'Mon, 3 PM' },
  { id: '2', title: 'Firebase Authentication', mentor: 'John Smith', time: 'Wed, 10 AM' },
  { id: '3', title: 'Intro to TypeScript', mentor: 'Kai Lee', time: 'Fri, 5 PM' },
];

const DUMMY_SKILLS: SkillItem[] = [
  { id: 's1', name: 'React Native', progress: 85, icon: 'logo-react' },
  { id: 's2', name: 'JavaScript', progress: 92, icon: 'logo-javascript' },
  { id: 's3', name: 'UI/UX Design', progress: 55, icon: 'color-palette-outline' },
  { id: 's4', name: 'APIs & REST', progress: 70, icon: 'cloud-download-outline' },
];

const DUMMY_SUGGESTED: SuggestedItem[] = [
  { id: 'sug1', title: 'Optimizing Redux', mentor: 'Sam Wilson', rating: 4.8 },
  { id: 'sug2', title: 'Node.js Security', mentor: 'Pat Chen', rating: 4.5 },
  { id: 'sug3', title: 'Testing with Jest', mentor: 'Jordan Grey', rating: 4.9 },
];

const SkillProgressBox = ({ skill }: { skill: SkillItem }) => (
  <View style={progressStyles.box}>
    <Ionicons name={skill.icon as any} size={30} color={COLORS.primary} />
    <Text style={progressStyles.skillName}>{skill.name}</Text>
    <View style={progressStyles.progressBarContainer}>
      <View style={[progressStyles.progressBar, { width: `${skill.progress}%` }]} />
    </View>
    <Text style={progressStyles.progressText}>{skill.progress}%</Text>
  </View>
);

const progressStyles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    marginRight: 16,
    width: width * 0.42,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  skillName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 6,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 4,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  reloadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  learningStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  checkbox: {
    marginRight: 12,
    alignSelf: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 22,
    fontWeight: '500',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  mentorSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mentorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textDark,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  lessonDetails: {
    fontSize: 14,
    color: COLORS.textSubtle,
    marginBottom: 2,
  },
  lessonTime: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  lessonStatus: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lessonStatusText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
});

const DashboardScreen = () => {
  const { logout, user } = useAuth();
  const [personalizedContent, setPersonalizedContent] = React.useState(null);
  const [personalizedClasses, setPersonalizedClasses] = React.useState(null);
  const [personalizedUpcoming, setPersonalizedUpcoming] = React.useState(null);
  const [personalizedSkills, setPersonalizedSkills] = React.useState(null);
  const [scheduledLessons, setScheduledLessons] = React.useState<Array<{id: string, title: string, mentorName: string, mentorSkill: string, date: string, time: string, duration: string, status: string}>>([]);
  const [classesLoading, setClassesLoading] = React.useState(false);
  const [upcomingLoading, setUpcomingLoading] = React.useState(false);
  const [showWaffleMenu, setShowWaffleMenu] = React.useState(false);
  
  const handleMatchTeacher = () => router.push('/(tabs)/MatchScreen');
  
  const addScheduledLesson = (lesson: {id: string, title: string, mentorName: string, mentorSkill: string, date: string, time: string, duration: string, status: string}) => {
    setScheduledLessons(prev => [...prev, lesson]);
  };
  
  const handleLogout = async () => {
    try {
      console.log('Logout button pressed');
      alert('Logout button pressed!'); // Temporary test
      await logout();
      console.log('Logout successful, navigating to home');
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Load personalized content when component mounts
  React.useEffect(() => {
    const initializeDashboard = async () => {
      if (user?.id) {
        // Check if this is a new user by looking for existing data
        const hasExistingData = await checkForExistingData();
        
        if (!hasExistingData) {
          // New user - clear all data and generate fresh content
          console.log('New user detected, clearing all data and generating fresh content');
          await clearAllUserData();
          setPersonalizedContent(null);
          setPersonalizedClasses(null);
          setPersonalizedUpcoming(null);
          setPersonalizedSkills(null);
          setScheduledLessons([]);
        }
        
        // ALWAYS generate personalized content based on user's skills
        if (user?.skills && user.skills.length > 0) {
          console.log('Generating personalized content for user with skills:', user.skills);
          console.log('User level:', user.level);
          console.log('User goals:', user.goals);
          
          // Generate all personalized content
          generatePersonalizedSkills(); // This will set all skills to 0%
          generatePersonalizedClasses();
          generatePersonalizedUpcoming();
        } else {
          console.log('No skills found for user:', user);
        }
      }
    };

    initializeDashboard();
  }, [user]);

  const checkForExistingData = async () => {
    try {
      // Check for user-specific data
      const userId = user?.id || 'anonymous';
      const userLessonsKey = `scheduledLessons_${userId}`;
      const userSessionsKey = `chatSessions_${userId}`;
      
      const lessonsStr = await AsyncStorage.getItem(userLessonsKey);
      const chatSessionsStr = await AsyncStorage.getItem(userSessionsKey);
      
      console.log('Checking existing data for user:', userId);
      console.log('Lessons exist:', !!lessonsStr);
      console.log('Chat sessions exist:', !!chatSessionsStr);
      
      return !!(lessonsStr || chatSessionsStr);
    } catch (error) {
      console.error('Error checking for existing data:', error);
      return false;
    }
  };

  const clearAllUserData = async () => {
    try {
      // Clear user-specific AsyncStorage data
      const userId = user?.id || 'anonymous';
      const userLessonsKey = `scheduledLessons_${userId}`;
      const userSessionsKey = `chatSessions_${userId}`;
      
      // Get all keys that start with user-specific prefixes
      const allKeys = await AsyncStorage.getAllKeys();
      const userSpecificKeys = allKeys.filter(key => 
        key.startsWith(`chat_${userId}_`) || 
        key === userLessonsKey || 
        key === userSessionsKey
      );
      
      if (userSpecificKeys.length > 0) {
        await AsyncStorage.multiRemove(userSpecificKeys);
        console.log('Cleared user-specific data for user:', userId, 'keys:', userSpecificKeys);
      }
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const loadScheduledLessons = async () => {
    try {
      // Load user-specific lessons
      const userLessonsKey = `scheduledLessons_${user?.id || 'anonymous'}`;
      console.log('🔍 LOADING LESSONS for user:', user?.id, 'with key:', userLessonsKey);
      
      // DEBUG: Check all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔍 ALL ASYNC STORAGE KEYS:', allKeys);
      const lessonKeys = allKeys.filter(key => key.includes('scheduledLessons'));
      console.log('🔍 LESSON KEYS FOUND:', lessonKeys);
      
      // DEBUG: Check what's in each lesson key
      for (const key of lessonKeys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`🔍 KEY: ${key}`, 'VALUE:', value);
      }
      
      const lessonsStr = await AsyncStorage.getItem(userLessonsKey);
      if (lessonsStr) {
        const lessons = JSON.parse(lessonsStr);
        console.log('✅ LOADED LESSONS for user:', lessons.length, 'lessons:', lessons);
        setScheduledLessons(lessons);
      } else {
        console.log('❌ NO LESSONS found for user:', user?.id);
        setScheduledLessons([]);
      }
    } catch (error) {
      console.error('❌ ERROR loading scheduled lessons:', error);
      setScheduledLessons([]);
    }
  };

  // Refresh user data when component mounts to ensure we have the latest profile
  React.useEffect(() => {
    const refreshData = async () => {
      if (user?.id) {
        try {
          const updatedUser = await AuthService.getUserProfile(user.id);
          if (updatedUser) {
            // Update the user context with fresh data
            // This ensures we have the latest personalized content
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
    };
    
    refreshData();
  }, []);

  // Refresh scheduled lessons when dashboard comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 DASHBOARD FOCUSED - Refreshing scheduled lessons');
      if (user?.id) {
        loadScheduledLessons();
      }
    }, [user?.id])
  );

  const generatePersonalizedClasses = async () => {
    try {
      console.log('Starting to generate personalized classes...');
      console.log('User skills:', user?.skills);
      setClassesLoading(true);
      
      // First check if classes were pre-generated during signup
      try {
        const preGeneratedClasses = await AsyncStorage.getItem('personalizedClasses');
        if (preGeneratedClasses) {
          const classes = JSON.parse(preGeneratedClasses);
          console.log('Found pre-generated classes:', classes);
          setPersonalizedClasses(classes);
          // Clear the pre-generated classes after loading
          await AsyncStorage.removeItem('personalizedClasses');
          return;
        }
      } catch (error) {
        console.log('No pre-generated classes found, generating new ones');
      }
      
      // Generate hardcoded classes based on user's skills
      const classes = generateClassesFromSkills(user?.skills || []);
      console.log('Generated classes from skills:', classes);
      
      setPersonalizedClasses(classes);
      console.log('Set personalized classes in state');
    } catch (error) {
      console.error('Failed to generate personalized classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  const generateClassesFromSkills = (skills: string[]) => {
    const classes: any[] = [];
    
    // Create classes for each skill
    skills.forEach((skill, index) => {
      const skillLower = skill.toLowerCase();
      
      // Generate class titles based on skill type
      let classTitle = '';
      let instructor = '';
      let duration = '';
      let level = user?.level || 'Beginner';
      
      if (skillLower.includes('cooking') || skillLower.includes('culinary')) {
        classTitle = 'Cooking Fundamentals';
        instructor = 'Chef Maria Rodriguez';
        duration = '2 hours';
      } else if (skillLower.includes('painting') || skillLower.includes('art')) {
        classTitle = 'Painting Techniques';
        instructor = 'Artist Sarah Chen';
        duration = '3 hours';
      } else if (skillLower.includes('gardening') || skillLower.includes('plant')) {
        classTitle = 'Gardening Basics';
        instructor = 'Master Gardener John';
        duration = '2.5 hours';
      } else if (skillLower.includes('dancing') || skillLower.includes('dance')) {
        classTitle = 'Dance Fundamentals';
        instructor = 'Dance Instructor Lisa';
        duration = '1.5 hours';
      } else if (skillLower.includes('leadership') || skillLower.includes('lead')) {
        classTitle = 'Leadership Skills';
        instructor = 'Executive Coach Mike';
        duration = '2 hours';
      } else if (skillLower.includes('speaking') || skillLower.includes('public')) {
        classTitle = 'Public Speaking Mastery';
        instructor = 'Communication Expert Anna';
        duration = '2.5 hours';
      } else if (skillLower.includes('first aid') || skillLower.includes('medical')) {
        classTitle = 'First Aid Certification';
        instructor = 'Medical Professional Dr. Smith';
        duration = '4 hours';
      } else if (skillLower.includes('javascript') || skillLower.includes('programming')) {
        classTitle = 'JavaScript Fundamentals';
        instructor = 'Senior Developer Alex';
        duration = '3 hours';
      } else if (skillLower.includes('python')) {
        classTitle = 'Python Programming';
        instructor = 'Data Scientist Emma';
        duration = '3.5 hours';
      } else if (skillLower.includes('design') || skillLower.includes('ui')) {
        classTitle = 'UI/UX Design';
        instructor = 'Designer Carlos';
        duration = '2.5 hours';
      } else {
        // Generic class for other skills
        classTitle = `${skill} Masterclass`;
        instructor = `${skill} Expert`;
        duration = '2 hours';
      }
      
      classes.push({
        id: `class_${index + 1}`,
        title: classTitle,
        instructor: instructor,
        duration: duration,
        level: level,
        skill: skill
      });
    });
    
    // If no skills, provide some default classes
    if (classes.length === 0) {
      return [
        {
          id: 'default_1',
          title: 'Introduction to Learning',
          instructor: 'Learning Coach',
          duration: '1 hour',
          level: 'Beginner',
          skill: 'General'
        }
      ];
    }
    
    return classes;
  };

  const generatePersonalizedUpcoming = async () => {
    try {
      setUpcomingLoading(true);
      // Generate hardcoded upcoming classes based on user's skills
      const upcoming = generateUpcomingFromSkills(user?.skills || []);
      setPersonalizedUpcoming(upcoming);
    } catch (error) {
      console.error('Failed to generate personalized upcoming classes:', error);
    } finally {
      setUpcomingLoading(false);
    }
  };

  const generateUpcomingFromSkills = (skills: string[]) => {
    const upcoming: any[] = [];
    
    // Create upcoming classes for the first 3 skills
    const skillsToUse = skills.slice(0, 3);
    
    skillsToUse.forEach((skill, index) => {
      const skillLower = skill.toLowerCase();
      
      let classTitle = '';
      let instructor = '';
      let duration = '';
      let time = '';
      let date = '';
      
      if (skillLower.includes('cooking') || skillLower.includes('culinary')) {
        classTitle = 'Advanced Cooking Techniques';
        instructor = 'Chef Maria Rodriguez';
        duration = '2 hours';
        time = '10:00 AM';
        date = 'Tomorrow';
      } else if (skillLower.includes('painting') || skillLower.includes('art')) {
        classTitle = 'Watercolor Workshop';
        instructor = 'Artist Sarah Chen';
        duration = '3 hours';
        time = '2:00 PM';
        date = 'Friday';
      } else if (skillLower.includes('gardening') || skillLower.includes('plant')) {
        classTitle = 'Seasonal Gardening';
        instructor = 'Master Gardener John';
        duration = '2.5 hours';
        time = '9:00 AM';
        date = 'Next Week';
      } else if (skillLower.includes('dancing') || skillLower.includes('dance')) {
        classTitle = 'Contemporary Dance';
        instructor = 'Dance Instructor Lisa';
        duration = '1.5 hours';
        time = '7:00 PM';
        date = 'Wednesday';
      } else if (skillLower.includes('leadership') || skillLower.includes('lead')) {
        classTitle = 'Team Leadership';
        instructor = 'Executive Coach Mike';
        duration = '2 hours';
        time = '11:00 AM';
        date = 'Monday';
      } else if (skillLower.includes('speaking') || skillLower.includes('public')) {
        classTitle = 'Presentation Skills';
        instructor = 'Communication Expert Anna';
        duration = '2.5 hours';
        time = '3:00 PM';
        date = 'Thursday';
      } else if (skillLower.includes('first aid') || skillLower.includes('medical')) {
        classTitle = 'CPR Certification';
        instructor = 'Medical Professional Dr. Smith';
        duration = '4 hours';
        time = '9:00 AM';
        date = 'Saturday';
      } else {
        // Generic upcoming class
        classTitle = `${skill} Advanced Session`;
        instructor = `${skill} Expert`;
        duration = '2 hours';
        time = '10:00 AM';
        date = 'Next Week';
      }
      
      upcoming.push({
        id: `upcoming_${index + 1}`,
        title: classTitle,
        instructor: instructor,
        duration: duration,
        level: user?.level || 'Beginner',
        skill: skill,
        time: time,
        date: date
      });
    });
    
    return upcoming;
  };

  const generatePersonalizedSkills = () => {
    try {
      console.log('User skills:', user?.skills);
      // Create personalized skills based on user's selected skills, starting at 0% progress
      const skills = (user?.skills || []).map((skill, index) => ({
        id: `skill_${index + 1}`,
        name: skill,
        progress: 0, // Always start at 0% for new users
      }));
      console.log('Generated personalized skills:', skills);
      setPersonalizedSkills(skills);
      console.log('Set personalized skills state:', skills);
    } catch (error) {
      console.error('Failed to generate personalized skills:', error);
    }
  };

  const regeneratePersonalizedContent = async () => {
    try {
      console.log('Current user:', user);
      console.log('User keys:', Object.keys(user || {}));
      
      // Try different possible ID fields
      const userId = user?.id || user?._id || user?.userId;
      console.log('User ID found:', userId);
      
      if (!userId) {
        console.error('No user ID found in any field');
        return;
      }
      
      const newPersonalizedContent = await GeminiService.generatePersonalizedContent({
        name: user?.name || 'User',
        skills: user?.skills || [],
        level: user?.level || 'Beginner',
        location: user?.location || 'Remote',
        mode: user?.mode || 'Online',
        bio: user?.bio || '',
        experience: user?.experience || '',
        goals: user?.goals || ''
      });
      
      console.log('Generated new content:', newPersonalizedContent);
      
      // Update the user's profile with new personalized content
      const updatedUser = await AuthService.updateDetailedProfile({
        userId: userId,
        skills: user.skills || [],
        level: user.level || 'Beginner',
        location: user.location || 'Remote',
        mode: user.mode || 'Online',
        bio: user.bio || '',
        experience: user.experience || '',
        goals: user.goals || '',
        personalizedContent: newPersonalizedContent,
      });
      
      console.log('Updated user:', updatedUser);
      setPersonalizedContent(newPersonalizedContent);
    } catch (error) {
      console.error('Failed to regenerate personalized content:', error);
      
      // Fallback: just update the local state with new content
      console.log('Using fallback: updating local state only');
      setPersonalizedContent({
        welcomeMessage: `Welcome to your personalized learning journey, ${user?.name || 'User'}!`,
        learningPath: [
          `Master ${user?.skills?.[0] || 'your chosen'} fundamentals and core concepts`,
          `Build practical projects combining ${user?.skills?.[0] || 'your skills'} and ${user?.skills?.[1] || 'other skills'}`,
          `Apply your skills in real-world ${user?.goals?.toLowerCase() || 'professional'} scenarios`
        ],
        personalizedGreeting: `Welcome, ${user?.name || 'User'}!`
      });
    }
  };

  const renderUpcomingClass = ({ item }: { item: ClassItem }) => (
    <View style={styles.classItem}>
      <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.classTitle}>{item.title}</Text>
        <Text style={styles.classMentor}>with {item.mentor}</Text>
      </View>
      <Text style={styles.classTime}>{item.time}</Text>
    </View>
  );

  const renderSuggestedClass = ({ item }: { item: SuggestedItem }) => (
    <TouchableOpacity style={styles.suggestedCard}>
      <Text style={styles.suggestedTitle}>{item.title}</Text>
      <Text style={styles.suggestedMentor}>Mentor: {item.mentor}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color={COLORS.warning} />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity 
        style={styles.container}
        activeOpacity={1}
        onPress={() => setShowWaffleMenu(false)}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Solid Top Area */}
        <View style={styles.topArea}>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.waffleIcon}
              onPress={() => setShowWaffleMenu(!showWaffleMenu)}
            >
              <Ionicons name="grid-outline" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
            
            {showWaffleMenu && (
              <View style={styles.waffleDropdown}>
                <TouchableOpacity
                  style={styles.waffleItem}
                  onPress={() => {
                    setShowWaffleMenu(false);
                    console.log('Profile tapped');
                  }}
                >
                  <Ionicons name="person-circle-outline" size={20} color={COLORS.textLight} />
                  <Text style={styles.waffleItemText}>Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.waffleItem}
                  onPress={() => {
                    setShowWaffleMenu(false);
                    router.push('/(tabs)/ChatHistory');
                  }}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color={COLORS.textLight} />
                  <Text style={styles.waffleItemText}>Chat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.waffleItem}
                  onPress={() => {
                    setShowWaffleMenu(false);
                    console.log('Logout button tapped');
                    alert('Logout button tapped!');
                    handleLogout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color={COLORS.textLight} />
                  <Text style={styles.waffleItemText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={() => {
                console.log('🔄 RELOAD BUTTON TAPPED - Refreshing everything');
                // Force refresh all personalized content with 0% skills
                if (user?.skills && user.skills.length > 0) {
                  generatePersonalizedSkills(); // This will FORCE 0% progress
                  generatePersonalizedClasses();
                  generatePersonalizedUpcoming();
                }
                // Also refresh scheduled lessons
                loadScheduledLessons();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <Text style={styles.greeting}>
            {personalizedContent?.personalizedGreeting || `Welcome, ${user?.name || 'User'}!`}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {personalizedContent?.welcomeMessage || "Let's keep learning today!"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Match Button */}
          <TouchableOpacity style={styles.matchButton} onPress={handleMatchTeacher}>
            <Ionicons name="heart" size={22} color={COLORS.textLight} />
            <Text style={styles.matchButtonText}>Find Your Perfect Mentor</Text>
          </TouchableOpacity>

          {/* Suggested Classes - Personalized - MOVED TO TOP */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💡 Suggested Classes {personalizedClasses ? `for ${user?.skills?.[0] || 'Your Skills'}` : ''}
            </Text>
            {classesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Generating personalized classes...</Text>
              </View>
            ) : (
              personalizedClasses && personalizedClasses.length > 0 ? (
                <FlatList
                  data={personalizedClasses}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSuggestedClass}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="school-outline" size={48} color={COLORS.primary} style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateTitle}>Generating your personalized classes...</Text>
                  <Text style={styles.emptyStateSubtitle}>Based on your chosen skills: {user?.skills?.join(', ') || 'Your Skills'}</Text>
                </View>
              )
            )}
          </View>


          {/* Upcoming Classes - Personalized */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Upcoming Classes</Text>
            {scheduledLessons.length > 0 ? (
              <View style={styles.card}>
                {scheduledLessons.map((lesson) => (
                  <View key={lesson.id} style={styles.lessonItem}>
                    <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonDetails}>{lesson.mentorName} • {lesson.mentorSkill}</Text>
                      <Text style={styles.lessonTime}>{lesson.date} • {lesson.time}</Text>
                    </View>
                    <View style={styles.lessonStatus}>
                      <Text style={styles.lessonStatusText}>{lesson.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.card}>
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="calendar-outline" size={48} color={COLORS.primary} style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateTitle}>No classes enrolled yet!</Text>
                  <Text style={styles.emptyStateSubtitle}>Start your learning journey by enrolling in a class</Text>
                </View>
              </View>
            )}
          </View>

          {/* Skills - Personalized */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Skill Progress</Text>
            {personalizedSkills && personalizedSkills.length > 0 ? (
              <FlatList
                data={personalizedSkills}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <SkillProgressBox skill={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="trending-up-outline" size={48} color={COLORS.primary} style={styles.emptyStateIcon} />
                <Text style={styles.emptyStateTitle}>No skills selected yet!</Text>
                <Text style={styles.emptyStateSubtitle}>Complete your profile to see your skill progress</Text>
              </View>
            )}
          </View>

        </ScrollView>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topArea: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRight: {
    position: 'absolute',
    top: 60,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1000,
  },
  waffleIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  waffleDropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  waffleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  waffleItemText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  profileButton: {
    // Remove absolute positioning since it's now in headerRight
  },
  greeting: { fontSize: 28, fontWeight: '700', color: COLORS.textLight },
  greetingSubtitle: { fontSize: 15, color: COLORS.textLight, opacity: 0.9, marginTop: 6 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

  matchButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.accent,
  paddingVertical: 16,
  borderRadius: 16,
  marginTop: 20,     // ✅ give space below purple header
  marginBottom: 28,
  shadowColor: COLORS.accent,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
},
  matchButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 14,
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  learningPathCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(123, 66, 246, 0.1)',
  },
  classItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  classTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  classMentor: { fontSize: 13, color: COLORS.textDark, opacity: 0.7 },
  classTime: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  separator: { height: 1, backgroundColor: COLORS.background, marginVertical: 6 },
  suggestedCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    width: width * 0.48,
    marginRight: 14,
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  suggestedTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  suggestedMentor: { fontSize: 12, color: COLORS.textDark, opacity: 0.65, marginTop: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { marginLeft: 4, fontSize: 13, fontWeight: '600', color: COLORS.warning },
});

export default DashboardScreen;
