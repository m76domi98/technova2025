import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';import SwipeDeck from './SwipeDeck'; // Adjust path as needed
import { Mentor } from './MentorCard'; // Import Mentor type

const COLORS = {
    primary: '#7B42F6', 
    background: '#F0F3FF', 
    textDark: '#333333',
    textLight: '#FFFFFF',
    
    textGray: '#666',
};

// Mock Data for Mentors
const MOCK_MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    service: 'Advanced React Native',
    fee: 50,
    location: 'New York, NY',
    mode: 'Remote',
    description: 'Experienced React Native developer, passionate about building performant mobile apps. Ready to share advanced techniques and best practices.',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1976&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    name: 'Bob Smith',
    service: 'Gourmet French Cooking',
    fee: 75,
    location: 'Paris, France',
    mode: 'Hybrid',
    description: 'Classically trained chef from Le Cordon Bleu, specializing in authentic French cuisine. Offering in-person and remote sessions.',
    photo: 'https://images.unsplash.com/photo-1507003211169-e69fe254fe58?auto=format&fit=crop&q=80&w=1935&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    service: 'Financial Planning',
    fee: 60,
    location: 'London, UK',
    mode: 'Remote',
    description: 'Certified financial advisor helping individuals and families achieve their financial goals. Learn budgeting, investing, and retirement planning.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1935&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '4',
    name: 'Diana Prince',
    service: 'Yoga & Meditation',
    fee: 40,
    location: 'Austin, TX',
    mode: 'In-person',
    description: 'Certified yoga instructor guiding students through Vinyasa and Hatha flows, with a focus on mindfulness and well-being.',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1961&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '5',
    name: 'Eve Adams',
    service: 'Digital Marketing',
    fee: 55,
    location: 'San Francisco, CA',
    mode: 'Remote',
    description: 'SEO, SEM, social media, and content strategy expert. Helping businesses grow their online presence and reach a wider audience.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?auto=format&fit=crop&q=80&w=1961&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

type HomeSwipeScreenProps = {
    onLogout: () => void; // Function to navigate back to login
    // Add any other props needed for filtering mentors based on user skills
};

export default function HomeSwipeScreen({ onLogout }: HomeSwipeScreenProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchMentors = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      setMentors(MOCK_MENTORS); // In a real app, this would be `setData(fetchedMentors)`
      setLoading(false);
    };

    fetchMentors();
  }, []);

  const handleSwipeRight = (mentor: Mentor) => {
    console.log(`Liked ${mentor.name} (ID: ${mentor.id})`);
    Alert.alert('Liked!', `You liked ${mentor.name} for ${mentor.service}.`);
    // Here you would typically send this "like" to your backend
  };

  const handleSwipeLeft = (mentor: Mentor) => {
    console.log(`Nope'd ${mentor.name} (ID: ${mentor.id})`);
    // Here you might record a "nope" for future recommendations
  };

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCardsContainer}>
      <Text style={styles.noMoreCardsText}>That's all the mentors for now!</Text>
      <Text style={styles.noMoreCardsSubText}>Come back later or adjust your preferences.</Text>
      {/* Optionally, add a button to go back to skill selection or refresh */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Back to Login</Text>
            </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding mentors...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Text style={styles.headerTitle}>Find Your Mentor</Text>
      <SwipeDeck
        data={mentors}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        renderNoMoreCards={renderNoMoreCards}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: StatusBar.currentHeight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    marginVertical: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: COLORS.textDark,
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  noMoreCardsSubText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.primary, // Using primary for logout button here
    borderRadius: 10,
  },
  logoutButtonText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  }
});