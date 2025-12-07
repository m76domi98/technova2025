import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

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
  online: '#4CAF50',
  offline: '#B3B3B3',
};

interface ChatSession {
  id: string;
  mentorName: string;
  mentorSkill: string;
  lastMessage: string;
  timestamp: Date | string;
  unreadCount: number;
}

export default function ChatHistory() {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatSessions();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadChatSessions();
    }, [])
  );

  const loadChatSessions = async () => {
    try {
      // Load user-specific chat sessions from AsyncStorage
      const userSessionsKey = `chatSessions_${user?.id || 'anonymous'}`;
      console.log('🔍 LOADING CHAT SESSIONS for user:', user?.id, 'with key:', userSessionsKey);
      
      const sessionsStr = await AsyncStorage.getItem(userSessionsKey);
      if (sessionsStr) {
        const sessions = JSON.parse(sessionsStr);
        console.log('✅ FOUND CHAT SESSIONS for user:', sessions.length, 'sessions:', sessions);
        // Only show sessions that have actual messages
        const sessionsWithMessages = sessions.filter((session: any) => 
          session.lastMessage && session.lastMessage !== 'No messages yet'
        );
        // Convert timestamp strings to Date objects
        const sessionsWithDates = sessionsWithMessages.map((session: any) => ({
          ...session,
          timestamp: typeof session.timestamp === 'string' ? new Date(session.timestamp) : session.timestamp
        }));
        console.log('✅ FILTERED SESSIONS with messages:', sessionsWithDates.length);
        setChatSessions(sessionsWithDates);
      } else {
        // No chat sessions yet - ensure clean state
        console.log('❌ NO CHAT SESSIONS found for user:', user?.id);
        setChatSessions([]);
      }
    } catch (error) {
      console.error('❌ ERROR loading chat sessions:', error);
      setChatSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (session: ChatSession) => {
    router.push({
      pathname: '/ChatScreen',
      params: {
        mentorName: session.mentorName,
        mentorSkill: session.mentorSkill,
        mentorEmail: `${session.mentorName.toLowerCase().replace(' ', '.')}@example.com`,
        mentorPhone: '+1-555-0123',
      },
    });
  };

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const renderChatSession = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.chatSession}
      onPress={() => openChat(item)}
    >
      <View style={styles.mentorAvatar}>
        <Ionicons name="school" size={24} color={COLORS.textLight} />
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.mentorName}>{item.mentorName}</Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        
        <Text style={styles.mentorSkill}>{item.mentorSkill}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={styles.placeholder} />
      </View>

      {chatSessions.length > 0 ? (
        <FlatList
          data={chatSessions}
          renderItem={renderChatSession}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textSubtle} />
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation with a mentor to see your chat history here
          </Text>
          <TouchableOpacity
            style={styles.findMentorButton}
            onPress={() => router.push('/(tabs)/MatchScreen')}
          >
            <Text style={styles.findMentorButtonText}>Find a Mentor</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSubtle,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: 10,
  },
  chatSession: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.textLight,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mentorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSubtle,
  },
  mentorSkill: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSubtle,
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  findMentorButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  findMentorButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
