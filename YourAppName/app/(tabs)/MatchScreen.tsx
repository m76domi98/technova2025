import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#7B42F6',
  accent: '#FF6F61',
  background: '#F0F3FF',
  textDark: '#2D2D2D',
  textLight: '#FFFFFF',
  textSubtle: '#6B7280',
  cardBackground: '#FFFFFF',
  shadowColor: '#4A4A4A',
  online: '#4CAF50',
  inPerson: '#2196F3',
  hybrid: '#FFC107',
  dislike: '#B3B3B3',
};

type Mentor = {
  id: string;
  name: string;
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  location: string;
  mode: 'Online' | 'In-person' | 'Hybrid';
  avatarColor: string;
  email?: string;
  phone?: string;
};

const generatePersonalizedMentors = (userSkills: string[], userLocation: string = 'Remote'): Mentor[] => {
  const mentors: Mentor[] = [];
  const avatarColors = ['#A5B5FF', '#FFD799', '#B1F4C5', '#C7B1FF', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'];
  const modes: Mentor['mode'][] = ['Online', 'In-person', 'Hybrid'];
  const levels: Mentor['level'][] = ['Beginner', 'Intermediate', 'Expert'];
  
  // Generate mentors for each skill
  userSkills.forEach((skill, index) => {
    const skillLower = skill.toLowerCase();
    
    let mentorName = '';
    let mentorSkill = '';
    let description = '';
    
    if (skillLower.includes('cooking') || skillLower.includes('culinary')) {
      mentorName = 'Chef Maria Rodriguez';
      mentorSkill = 'Culinary Arts';
      description = 'Professional chef with 15+ years experience in fine dining and home cooking techniques.';
    } else if (skillLower.includes('painting') || skillLower.includes('art')) {
      mentorName = 'Artist Sarah Chen';
      mentorSkill = 'Visual Arts';
      description = 'Award-winning painter and art instructor specializing in watercolor and acrylic techniques.';
    } else if (skillLower.includes('gardening') || skillLower.includes('plant')) {
      mentorName = 'Master Gardener John';
      mentorSkill = 'Horticulture';
      description = 'Certified master gardener with expertise in organic farming and sustainable gardening practices.';
    } else if (skillLower.includes('dancing') || skillLower.includes('dance')) {
      mentorName = 'Dance Instructor Lisa';
      mentorSkill = 'Dance & Movement';
      description = 'Professional dancer and choreographer with 20+ years teaching experience in various dance styles.';
    } else if (skillLower.includes('leadership') || skillLower.includes('lead')) {
      mentorName = 'Executive Coach Mike';
      mentorSkill = 'Leadership Development';
      description = 'Former Fortune 500 executive turned leadership coach, specializing in team management and strategic thinking.';
    } else if (skillLower.includes('speaking') || skillLower.includes('public')) {
      mentorName = 'Communication Expert Anna';
      mentorSkill = 'Public Speaking';
      description = 'TEDx speaker and communication coach helping professionals overcome stage fright and deliver powerful presentations.';
    } else if (skillLower.includes('first aid') || skillLower.includes('medical')) {
      mentorName = 'Dr. Sarah Mitchell';
      mentorSkill = 'Emergency Medicine';
      description = 'Emergency room physician and certified first aid instructor with extensive trauma care experience.';
    } else if (skillLower.includes('javascript') || skillLower.includes('programming')) {
      mentorName = 'Senior Developer Alex';
      mentorSkill = 'Software Development';
      description = 'Full-stack developer and tech lead with expertise in modern JavaScript frameworks and cloud architecture.';
    } else if (skillLower.includes('python')) {
      mentorName = 'Data Scientist Emma';
      mentorSkill = 'Python Programming';
      description = 'Senior data scientist specializing in machine learning, data analysis, and Python automation.';
    } else if (skillLower.includes('design') || skillLower.includes('ui')) {
      mentorName = 'UX Designer Carlos';
      mentorSkill = 'User Experience Design';
      description = 'Senior UX designer with 10+ years creating intuitive digital experiences for Fortune 500 companies.';
    } else if (skillLower.includes('writing') || skillLower.includes('write')) {
      mentorName = 'Author Jennifer';
      mentorSkill = 'Creative Writing';
      description = 'Published author and writing coach helping aspiring writers develop their voice and storytelling skills.';
    } else if (skillLower.includes('translation') || skillLower.includes('translate')) {
      mentorName = 'Dr. Pierre Dubois';
      mentorSkill = 'Linguistics & Translation';
      description = 'Polyglot linguist and certified translator with expertise in multiple languages and cultural contexts.';
    } else if (skillLower.includes('french')) {
      mentorName = 'French Tutor Marie';
      mentorSkill = 'French Language';
      description = 'Native French speaker and language instructor with 12+ years teaching French to international students.';
    } else if (skillLower.includes('spanish')) {
      mentorName = 'Spanish Tutor Carlos';
      mentorSkill = 'Spanish Language';
      description = 'Native Spanish speaker and certified language teacher specializing in conversational Spanish and business communication.';
    } else {
      // Generic mentor for other skills
      mentorName = `${skill} Expert`;
      mentorSkill = skill;
      description = `Professional ${skill.toLowerCase()} instructor with extensive experience and proven track record.`;
    }
    
    mentors.push({
      id: `mentor_${index + 1}`,
      name: mentorName,
      skill: mentorSkill,
      level: levels[index % levels.length],
      location: userLocation,
      mode: modes[index % modes.length],
      avatarColor: avatarColors[index % avatarColors.length],
      email: `${mentorName.toLowerCase().replace(/\s+/g, '.')}@mentorapp.com`,
      phone: `555-${1000 + index}`
    });
  });
  
  return mentors;
};

const SWIPE_THRESHOLD = 120;

const ModeBadge = ({ mode }: { mode: Mentor['mode'] }) => {
  let color = COLORS.inPerson;
  let icon = 'people';
  if (mode === 'Online') { color = COLORS.online; icon = 'globe-outline'; }
  else if (mode === 'Hybrid') { color = COLORS.hybrid; icon = 'sync-outline'; }

  return (
    <View style={[badgeStyles.container, { backgroundColor: color + '20', borderColor: color }]}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={[badgeStyles.text, { color }]}>{mode}</Text>
    </View>
  );
};

const MatchScreen = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [matches, setMatches] = useState<Mentor[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [positions, setPositions] = useState<Animated.ValueXY[]>([]);

  const router = useRouter();

  // Generate personalized mentors based on user's skills
  useEffect(() => {
    if (user?.skills && user.skills.length > 0) {
      console.log('Generating personalized mentors for skills:', user.skills);
      const personalizedMentors = generatePersonalizedMentors(user.skills, user.location || 'Remote');
      console.log('Generated mentors:', personalizedMentors);
      setMentors(personalizedMentors);
      setPositions(personalizedMentors.map(() => new Animated.ValueXY()));
      setIsLoading(false);
    } else {
      console.log('No user skills found, using default mentors');
      const defaultMentors = generatePersonalizedMentors(['Cooking', 'Gardening', 'Public Speaking', 'Leadership']);
      setMentors(defaultMentors);
      setPositions(defaultMentors.map(() => new Animated.ValueXY()));
      setIsLoading(false);
    }
  }, [user?.skills, user?.location]);

  const swipeCard = (index: number, direction: 'left' | 'right') => {
    if (index >= mentors.length) return;

    const current = mentors[index];
    if (direction === 'right' && !matches.find(m => m.id === current.id)) {
      setMatches(prev => [...prev, current]);
    }

    const x = direction === 'right' ? width * 1.5 : -width * 1.5;
    Animated.timing(positions[index], {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      positions[index].setValue({ x: 0, y: 0 });
      setMentors(prev => prev.filter((_, i) => i !== index));
      setPositions(prev => prev.filter((_, i) => i !== index));
    });
  };

  const renderCard = (mentor: Mentor, index: number) => {
    const isTopCard = index === 0;
    const position = positions[index];

    const rotate = position.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    const likeOpacity = position.x.interpolate({ inputRange: [0, width / 4], outputRange: [0, 1], extrapolate: 'clamp' });
    const nopeOpacity = position.x.interpolate({ inputRange: [-width / 4, 0], outputRange: [1, 0], extrapolate: 'clamp' });

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => isTopCard,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) swipeCard(index, 'right');
        else if (gesture.dx < -SWIPE_THRESHOLD) swipeCard(index, 'left');
        else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    });

    return (
      <Animated.View key={mentor.id} style={[styles.card, { zIndex: mentors.length - index, transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]} {...(isTopCard ? panResponder.panHandlers : {})}>
        {isTopCard && (
          <>
            <Animated.View style={[styles.statusLabel, styles.likeLabel, { opacity: likeOpacity }]}><Text style={styles.labelText}>MATCH</Text></Animated.View>
            <Animated.View style={[styles.statusLabel, styles.nopeLabel, { opacity: nopeOpacity }]}><Text style={styles.labelText}>NOPE</Text></Animated.View>
          </>
        )}
        <View style={[styles.avatarContainer, { backgroundColor: mentor.avatarColor }]}>
          <Ionicons name="school" size={70} color={COLORS.textLight} />
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.name}>{mentor.name} <Text style={styles.location}>from {mentor.location}</Text></Text>
          <View style={styles.detailRow}><Ionicons name="laptop-outline" size={18} color={COLORS.textSubtle} /><Text style={styles.skill}>{mentor.skill}</Text></View>
          <View style={styles.detailRow}><Ionicons name="analytics-outline" size={18} color={COLORS.textSubtle} /><Text style={styles.level}>Expertise: <Text style={styles.levelValue}>{mentor.level}</Text></Text></View>
        </View>
        <View style={styles.modeSection}><ModeBadge mode={mentor.mode} /></View>
      </Animated.View>
    );
  };

  const renderMatchesList = () => (
    <View style={styles.matchesContainer}>
      <Text style={styles.matchesTitle}>Your Matches</Text>
      <ScrollView
        style={styles.matchesScrollView}
        contentContainerStyle={styles.matchesScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {matches.map(match => (
          <View key={match.id} style={styles.matchCardWide}>
            <View style={styles.matchLeftWide}>
              <View style={[styles.matchAvatarWide, { backgroundColor: match.avatarColor }]}>
                <Ionicons name="school" size={40} color={COLORS.textLight} />
              </View>
              <View style={styles.matchInfoWide}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.matchSkill}>{match.skill} | {match.level}</Text>
                <Text style={styles.matchContact}>Location: {match.location}</Text>
                <Text style={styles.matchContact}>Email: {match.email}</Text>
                <Text style={styles.matchContact}>Phone: {match.phone}</Text>
              </View>
            </View>
            <View style={styles.matchRightWide}>
              <ModeBadge mode={match.mode} />
              <TouchableOpacity
                style={styles.chatButtonWide}
                onPress={() => router.push({ 
                  pathname: '/ChatScreen', 
                  params: { 
                    mentorName: match.name,
                    mentorSkill: match.skill,
                    mentorEmail: match.email,
                    mentorPhone: match.phone
                  } 
                })}
              >
                <Text style={styles.chatButtonTextWide}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.backButton} onPress={() => setShowMatches(false)}>
          <Text style={styles.backButtonText}>Back to Swipe</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <StatusBar hidden />
          <TouchableOpacity style={styles.topBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.textDark} />
            <Text style={styles.topBackText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.loadingContainer}>
            <Ionicons name="school" size={60} color={COLORS.primary} />
            <Text style={styles.loadingText}>Finding your perfect mentors...</Text>
            <Text style={styles.loadingSubtext}>Based on your skills: {user?.skills?.join(', ') || 'Your Skills'}</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar hidden />

        <TouchableOpacity style={styles.topBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.textDark} />
          <Text style={styles.topBackText}>Back</Text>
        </TouchableOpacity>

        {showMatches ? renderMatchesList() : (
          <View style={styles.cardWrapper}>
            {mentors.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={60} color={COLORS.online} style={{ marginBottom: 15 }} />
                <Text style={styles.noMentors}>That's everyone!</Text>
                <Text style={styles.noMentorsSubtext}>Check back later or refine your preferences.</Text>
                {matches.length > 0 && (
                  <TouchableOpacity style={styles.viewMatchesButton} onPress={() => setShowMatches(true)}>
                    <Text style={styles.viewMatchesText}>View Matches ({matches.length})</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : mentors.map(renderCard).reverse()}

            {mentors.length > 0 && !showMatches && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.dislike }]} onPress={() => swipeCard(0, 'left')}>
                  <Ionicons name="close" size={32} color={COLORS.textLight} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.online }]} onPress={() => swipeCard(0, 'right')}>
                  <Ionicons name="heart" size={32} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
  topBackButton: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center', zIndex: 20 },
  topBackText: { marginLeft: 6, fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  cardWrapper: { flex: 1, width, justifyContent: 'center', alignItems: 'center' },
  card: {
    position: 'absolute', width: width * 0.85, height: height * 0.55,
    backgroundColor: COLORS.cardBackground, borderRadius: 20, padding: 20,
    shadowColor: COLORS.shadowColor, shadowOpacity: 0.15, shadowOffset: { width: 0, height: 10 }, shadowRadius: 15, elevation: 10,
    flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, marginTop: 10,
    borderWidth: 5, borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: COLORS.shadowColor, shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 5,
  },
  infoSection: { width: '100%', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 26, fontWeight: '900', color: COLORS.textDark, marginBottom: 5, textAlign: 'center' },
  location: { fontSize: 16, fontWeight: '500', color: COLORS.textSubtle },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  skill: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginLeft: 8 },
  level: { fontSize: 14, color: COLORS.textSubtle, marginLeft: 8 },
  levelValue: { fontWeight: '700', color: COLORS.textDark },
  modeSection: { position: 'absolute', bottom: 15 },
  statusLabel: { position: 'absolute', top: 30, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 4, transform: [{ rotate: '-15deg' }], zIndex: 10 },
  likeLabel: { left: 20, borderColor: COLORS.online, backgroundColor: COLORS.online + '60' },
  nopeLabel: { right: 20, borderColor: COLORS.accent, backgroundColor: COLORS.accent + '60' },
  labelText: { fontSize: 28, fontWeight: 'bold', color: COLORS.textLight },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 120 },
  noMentors: { fontSize: 22, fontWeight: '700', color: COLORS.textDark, marginBottom: 5 },
  noMentorsSubtext: { fontSize: 16, color: COLORS.textSubtle, textAlign: 'center' },
  viewMatchesButton: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: COLORS.accent, borderRadius: 25 },
  viewMatchesText: { color: COLORS.textLight, fontWeight: '700', fontSize: 16 },
  matchesContainer: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  matchesTitle: { fontSize: 24, fontWeight: '700', marginBottom: 15, textAlign: 'center', color: COLORS.textDark },
  matchesScrollView: { flex: 1 },
  matchesScrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  matchCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
    width: width * 0.95,
    minHeight: 90,
  },
  matchLeftWide: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  matchAvatarWide: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  matchInfoWide: { flexShrink: 1 },
  matchName: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  matchSkill: { fontSize: 14, color: COLORS.textSubtle, marginBottom: 2 },
  matchContact: { fontSize: 12, color: COLORS.textSubtle },
  matchRightWide: { justifyContent: 'space-between', alignItems: 'center' },
  chatButtonWide: { marginTop: 8, backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  chatButtonTextWide: { color: COLORS.textLight, fontWeight: '700', fontSize: 14 },
  backButton: { marginTop: 20, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, backgroundColor: COLORS.accent },
  backButtonText: { color: COLORS.textLight, fontWeight: '700', fontSize: 16 },
  actionButtons: { position: 'absolute', bottom: 50, flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
  actionButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: COLORS.textSubtle,
    marginTop: 10,
    textAlign: 'center',
  },
});

const badgeStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  text: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
});


export default MatchScreen;
