import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/authService';
import GeminiService from '../../services/geminiService';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#7B42F6',
  secondary: '#A5B5FF',
  accent: '#FF6F61',
  background: '#F9FAFF',
  textDark: '#2D2D2D',
  textLight: '#FFFFFF',
  textSubtle: '#6B7280',
  inputBackground: '#F0F3FF',
  success: '#4CAF50',
  warning: '#FFC107',
};

const SKILLS = [
  // Technology & Programming
  'JavaScript', 'Python', 'React Native', 'Web Development', 'Data Science',
  'Machine Learning', 'UI/UX Design', 'Mobile Development', 'Cloud Computing',
  
  // Arts & Creative
  'Painting', 'Photography', 'Music Production', 'Creative Writing', 'Graphic Design',
  
  // Languages & Communication
  'Spanish', 'French', 'Public Speaking', 'Writing', 'Translation',
  
  // Cooking & Culinary
  'Cooking', 'Baking', 'Wine Tasting', 'Nutrition',
  
  // Sports & Fitness
  'Basketball', 'Yoga', 'Swimming', 'Running', 'Dancing',
  
  // Gardening & Nature
  'Gardening', 'Plant Care', 'Sustainable Living',
  
  // Business & Finance
  'Entrepreneurship', 'Marketing', 'Leadership', 'Finance',
  
  // Crafts & DIY
  'Woodworking', 'Sewing', 'Jewelry Making',
  
  // Health & Wellness
  'Meditation', 'First Aid', 'Mental Health',
  
  // Other Skills
  'Teaching', 'Coaching', 'Event Planning', 'Acting'
];

const LEVELS = ['Beginner', 'Intermediate', 'Expert'];
const MODES = ['Online', 'In-person', 'Hybrid'];
const LOCATIONS = ['Remote', 'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Other'];

interface SignupData {
  name: string;
  email: string;
  password: string;
  skills: string[];
  customSkill: string;
  level: string;
  location: string;
  mode: string;
  bio: string;
  experience: string;
  goals: string;
}

export default function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    skills: [],
    customSkill: '',
    level: '',
    location: '',
    mode: '',
    bio: '',
    experience: '',
    goals: '',
  });

  const { register, refreshUser } = useAuth();

  const generateClassesFromSkills = (skills: string[]) => {
    const classes: any[] = [];
    
    // Create classes for each skill
    skills.forEach((skill, index) => {
      const skillLower = skill.toLowerCase();
      
      // Generate class titles based on skill type
      let classTitle = '';
      let instructor = '';
      let duration = '';
      let level = signupData.level || 'Beginner';
      
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
      } else if (skillLower.includes('writing') || skillLower.includes('write')) {
        classTitle = 'Creative Writing';
        instructor = 'Author Jennifer';
        duration = '2 hours';
      } else if (skillLower.includes('translation') || skillLower.includes('translate')) {
        classTitle = 'Translation Skills';
        instructor = 'Linguist Dr. Pierre';
        duration = '2.5 hours';
      } else if (skillLower.includes('french')) {
        classTitle = 'French Language';
        instructor = 'French Tutor Marie';
        duration = '2 hours';
      } else if (skillLower.includes('spanish')) {
        classTitle = 'Spanish Language';
        instructor = 'Spanish Tutor Carlos';
        duration = '2 hours';
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
    
    return classes;
  };

  const updateField = (field: keyof SignupData, value: string | string[]) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setSignupData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addCustomSkill = () => {
    const customSkill = signupData.customSkill.trim();
    if (customSkill && !signupData.skills.includes(customSkill)) {
      setSignupData(prev => ({
        ...prev,
        skills: [...prev.skills, customSkill],
        customSkill: ''
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (signupData.skills.length < 5) {
      Alert.alert('Error', 'Please select at least 5 skills');
      return;
    }

    try {
      setIsLoading(true);
      
      // Register the user first
      await register(signupData.name, signupData.email, signupData.password);
      
      // Generate personalized content using Gemini AI
      const personalizedContent = await GeminiService.generatePersonalizedContent({
        name: signupData.name,
        skills: signupData.skills,
        level: signupData.level,
        location: signupData.location,
        mode: signupData.mode,
        bio: signupData.bio,
        experience: signupData.experience,
        goals: signupData.goals,
      });
      
      // Save detailed profile data to backend
      await AuthService.updateDetailedProfile({
        skills: signupData.skills,
        level: signupData.level,
        location: signupData.location,
        mode: signupData.mode,
        bio: signupData.bio,
        experience: signupData.experience,
        goals: signupData.goals,
        personalizedContent: personalizedContent,
      });
      
      // Generate personalized classes immediately based on user's skills
      const personalizedClasses = generateClassesFromSkills(signupData.skills);
      console.log('Generated classes for user:', personalizedClasses);
      
      // Save classes to AsyncStorage for instant display on dashboard
      try {
        await AsyncStorage.setItem('personalizedClasses', JSON.stringify(personalizedClasses));
        console.log('Saved personalized classes to AsyncStorage');
      } catch (storageError) {
        console.error('Failed to save classes to AsyncStorage:', storageError);
      }
      
      // Refresh user data to get the updated profile
      await refreshUser();
      
      router.replace('/(tabs)/Dashboard');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={signupData.name}
          onChangeText={(text) => updateField('name', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={signupData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          value={signupData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Skills</Text>
      <Text style={styles.stepSubtitle}>Choose at least 5 skills you want to learn or teach</Text>
      
      <View style={styles.skillsContainer}>
        {SKILLS.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[
              styles.skillChip,
              signupData.skills.includes(skill) && styles.skillChipSelected
            ]}
            onPress={() => toggleSkill(skill)}
          >
            <Text style={[
              styles.skillText,
              signupData.skills.includes(skill) && styles.skillTextSelected
            ]}>
              {skill}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.skillCount}>
        Selected: {signupData.skills.length}/5 minimum
      </Text>
      
      {/* Custom Skill Input */}
      <View style={styles.customSkillContainer}>
        <Text style={styles.inputLabel}>Don't see your skill? Add it here:</Text>
        <View style={styles.customSkillInputContainer}>
          <TextInput
            style={styles.customSkillInput}
            placeholder="Enter your custom skill..."
            value={signupData.customSkill}
            onChangeText={(text) => updateField('customSkill', text)}
            placeholderTextColor={COLORS.textSubtle}
          />
          <TouchableOpacity
            style={[
              styles.addCustomSkillButton,
              (!signupData.customSkill.trim() || signupData.skills.includes(signupData.customSkill.trim())) && styles.addCustomSkillButtonDisabled
            ]}
            onPress={addCustomSkill}
            disabled={!signupData.customSkill.trim() || signupData.skills.includes(signupData.customSkill.trim())}
          >
            <Ionicons name="add" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Experience & Preferences</Text>
      <Text style={styles.stepSubtitle}>Help us understand your background</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Experience Level</Text>
        <View style={styles.optionsContainer}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                signupData.level === level && styles.optionButtonSelected
              ]}
              onPress={() => updateField('level', level)}
            >
              <Text style={[
                styles.optionText,
                signupData.level === level && styles.optionTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Location</Text>
        <View style={styles.optionsContainer}>
          {LOCATIONS.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.optionButton,
                signupData.location === location && styles.optionButtonSelected
              ]}
              onPress={() => updateField('location', location)}
            >
              <Text style={[
                styles.optionText,
                signupData.location === location && styles.optionTextSelected
              ]}>
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Preferred Mode</Text>
        <View style={styles.optionsContainer}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.optionButton,
                signupData.mode === mode && styles.optionButtonSelected
              ]}
              onPress={() => updateField('mode', mode)}
            >
              <Text style={[
                styles.optionText,
                signupData.mode === mode && styles.optionTextSelected
              ]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell Us More</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about yourself..."
          value={signupData.bio}
          onChangeText={(text) => updateField('bio', text)}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Experience Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your professional experience..."
          value={signupData.experience}
          onChangeText={(text) => updateField('experience', text)}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Learning Goals</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What do you want to achieve?"
          value={signupData.goals}
          onChangeText={(text) => updateField('goals', text)}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{currentStep}/4</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(currentStep / 4) * 100}%` }]} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.textLight} size="small" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'Create Account' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  stepIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stepText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.textLight,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSubtle,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  skillChip: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  skillChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  skillText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  skillTextSelected: {
    color: COLORS.textLight,
  },
  skillCount: {
    fontSize: 14,
    color: COLORS.textSubtle,
    textAlign: 'center',
    marginTop: 10,
  },
  customSkillContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBackground,
  },
  customSkillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  customSkillInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textDark,
    marginRight: 12,
  },
  addCustomSkillButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomSkillButtonDisabled: {
    backgroundColor: COLORS.textSubtle,
    opacity: 0.5,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.textLight,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
