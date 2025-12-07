import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import GeminiService from '../../services/geminiService';

const { width } = Dimensions.get('window');

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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'mentor';
  timestamp: Date;
  isRead: boolean;
  lessonScheduling?: {
    mentorName: string;
    mentorSkill: string;
    mentorEmail: string;
  };
}

interface ScheduledLesson {
  id: string;
  title: string;
  mentorName: string;
  mentorSkill: string;
  date: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function ChatScreen() {
  const { mentorName, mentorSkill, mentorEmail, mentorPhone } = useLocalSearchParams<{
    mentorName?: string;
    mentorSkill?: string;
    mentorEmail?: string;
    mentorPhone?: string;
  }>();

  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLessonScheduler, setShowLessonScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize with empty messages - user starts the conversation
  useEffect(() => {
    // Load existing chat history for this mentor - only when user is available
    if (user?.id) {
      console.log('Loading chat history for user:', user.id);
      loadChatHistory();
    }
  }, [mentorName, mentorSkill, user?.id]);

  const loadChatHistory = async () => {
    try {
      // Make chat history user-specific
      const chatKey = `chat_${user?.id || 'anonymous'}_${mentorName}_${mentorSkill}`;
      console.log('Loading chat history for user:', user?.id, 'with key:', chatKey);
      const historyStr = await AsyncStorage.getItem(chatKey);
      if (historyStr) {
        const history = JSON.parse(historyStr);
        // Convert timestamp strings back to Date objects
        const parsedHistory = history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        console.log('Loaded chat history for user:', parsedHistory.length, 'messages');
        setMessages(parsedHistory);
      } else {
        console.log('No chat history found for user:', user?.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    }
  };

  const saveChatHistory = async (messages: Message[]) => {
    try {
      // Make chat history user-specific
      const chatKey = `chat_${user?.id || 'anonymous'}_${mentorName}_${mentorSkill}`;
      console.log('Saving chat history for user:', user?.id, 'with key:', chatKey);
      await AsyncStorage.setItem(chatKey, JSON.stringify(messages));
      
      // Also update chat sessions list
      await updateChatSessions();
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  const updateChatSessions = async () => {
    try {
      // Make chat sessions user-specific
      const userSessionsKey = `chatSessions_${user?.id || 'anonymous'}`;
      console.log('Updating chat sessions for user:', user?.id, 'with key:', userSessionsKey);
      
      const sessionsStr = await AsyncStorage.getItem(userSessionsKey);
      const sessions = sessionsStr ? JSON.parse(sessionsStr) : [];
      
      // Find or create session for this mentor
      const existingSessionIndex = sessions.findIndex(
        (session: any) => session.mentorName === mentorName && session.mentorSkill === mentorSkill
      );
      
      const sessionData = {
        id: `${mentorName}_${mentorSkill}`,
        mentorName: mentorName || 'Mentor',
        mentorSkill: mentorSkill || 'Skill',
        lastMessage: messages[messages.length - 1]?.text || 'No messages yet',
        timestamp: new Date(),
        unreadCount: 0,
      };
      
      if (existingSessionIndex >= 0) {
        sessions[existingSessionIndex] = sessionData;
      } else {
        sessions.push(sessionData);
      }
      
      await AsyncStorage.setItem(userSessionsKey, JSON.stringify(sessions));
      console.log('Updated chat sessions for user:', user?.id, 'sessions:', sessions.length);
    } catch (error) {
      console.error('Failed to update chat sessions:', error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      isRead: true,
    };

    setMessages(prev => {
      const updatedMessages = [...prev, userMessage];
      saveChatHistory(updatedMessages);
      return updatedMessages;
    });
    const currentMessage = newMessage.trim();
    setNewMessage('');

    // Show typing indicator
    setIsTyping(true);

    try {
      console.log('Generating mentor response for:', currentMessage);
      console.log('Mentor skill:', mentorSkill);
      console.log('User context:', {
        name: user?.name || 'Student',
        skills: user?.skills || [],
        level: user?.level || 'Beginner'
      });
      
      // Generate intelligent response using Gemini API
      const mentorResponse = await GeminiService.generateMentorResponse(
        currentMessage,
        mentorSkill || 'your chosen skill',
        {
          name: user?.name || 'Student',
          skills: user?.skills || [],
          level: user?.level || 'Beginner'
        }
      );
      
      console.log('Received mentor response:', mentorResponse);
      
      const mentorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: mentorResponse,
        sender: 'mentor',
        timestamp: new Date(),
        isRead: true,
      };

      setMessages(prev => [...prev, mentorMessage]);
    } catch (error) {
      console.error('Failed to generate mentor response:', error);
      console.error('Error details:', error);
      
      // Fallback response if API fails
      const fallbackResponse = `That's a great question about ${mentorSkill || 'your learning'}! Let me help you with that. What specific aspect would you like to explore further?`;
      
      const mentorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'mentor',
        timestamp: new Date(),
        isRead: true,
      };

      setMessages(prev => {
        const updatedMessages = [...prev, mentorMessage];
        saveChatHistory(updatedMessages);
        return updatedMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const scheduleLesson = () => {
    if (!selectedDate || !selectedTime) return;

    console.log('SCHEDULING LESSON - User ID:', user?.id);
    console.log('Selected date:', selectedDate);
    console.log('Selected time:', selectedTime);
    console.log('Mentor name:', mentorName);
    console.log('Mentor skill:', mentorSkill);

    const lessonMessage: Message = {
      id: Date.now().toString(),
      text: `Great! I've scheduled your ${mentorSkill} lesson for ${selectedDate} at ${selectedTime}. I'll send you a confirmation email shortly.`,
      sender: 'mentor',
      timestamp: new Date(),
      isRead: true,
    };

    setMessages(prev => {
      const updatedMessages = [...prev, lessonMessage];
      saveChatHistory(updatedMessages); // Save the updated messages
      return updatedMessages;
    });
    setShowLessonScheduler(false);
    setSelectedDate('');
    setSelectedTime('');
    setShowSuccessMessage(true);

    // Add lesson to dashboard (in a real app, this would be saved to backend)
    const newLesson = {
      id: Date.now().toString(),
      title: `${mentorSkill} Lesson with ${mentorName}`,
      mentorName: mentorName || 'Mentor',
      mentorSkill: mentorSkill || 'Skill',
      date: selectedDate,
      time: selectedTime,
      duration: '1 hour',
      status: 'scheduled'
    };

    // Store in AsyncStorage for persistence - USER SPECIFIC
    const userLessonsKey = `scheduledLessons_${user?.id || 'anonymous'}`;
    console.log('Saving lesson with key:', userLessonsKey);
    
    AsyncStorage.getItem(userLessonsKey).then(existingLessonsStr => {
      const existingLessons = existingLessonsStr ? JSON.parse(existingLessonsStr) : [];
      const updatedLessons = [...existingLessons, newLesson];
      AsyncStorage.setItem(userLessonsKey, JSON.stringify(updatedLessons));
      console.log(`✅ SAVED LESSON for user ${user?.id}:`, newLesson);
      console.log('Total lessons for user:', updatedLessons.length);
    }).catch(error => {
      console.error('❌ ERROR saving lesson:', error);
    });
  };

  const goToDashboard = () => {
    router.push('/(tabs)/Dashboard');
  };

  const renderDatePicker = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const dateOptions = [
      { label: 'Today', value: today.toLocaleDateString() },
      { label: 'Tomorrow', value: tomorrow.toLocaleDateString() },
      { label: 'Next Week', value: nextWeek.toLocaleDateString() }
    ];

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>Select Date</Text>
        {dateOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.pickerOption}
            onPress={() => {
              setSelectedDate(option.value);
              setShowDatePicker(false);
            }}
          >
            <Text style={styles.pickerOptionText}>{option.label}</Text>
            <Text style={styles.pickerOptionValue}>{option.value}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.pickerCancel}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.pickerCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTimePicker = () => {
    const timeOptions = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>Select Time</Text>
        {timeOptions.map((time, index) => (
          <TouchableOpacity
            key={index}
            style={styles.pickerOption}
            onPress={() => {
              setSelectedTime(time);
              setShowTimePicker(false);
            }}
          >
            <Text style={styles.pickerOptionText}>{time}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.pickerCancel}
          onPress={() => setShowTimePicker(false)}
        >
          <Text style={styles.pickerCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLessonScheduler = () => (
    <View style={styles.lessonSchedulerContainer}>
      <Text style={styles.lessonSchedulerTitle}>Schedule Your Lesson</Text>
      <Text style={styles.lessonSchedulerSubtitle}>Choose a date and time for your {mentorSkill} session</Text>
      
      <View style={styles.dateTimeContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedDate || 'Select Date'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSubtle} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Time</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedTime || 'Select Time'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSubtle} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.schedulerButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowLessonScheduler(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.scheduleButton, (!selectedDate || !selectedTime) && styles.scheduleButtonDisabled]}
          onPress={scheduleLesson}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.scheduleButtonText}>Schedule Lesson</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    const shouldShowScheduler = message.sender === 'mentor' && 
      (message.text.toLowerCase().includes('schedule') || 
       message.text.toLowerCase().includes('book') || 
       message.text.toLowerCase().includes('lesson'));

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.sender === 'user' ? styles.userMessage : styles.mentorMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            message.sender === 'user' ? styles.userBubble : styles.mentorBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.sender === 'user' ? styles.userText : styles.mentorText,
            ]}
          >
            {message.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              message.sender === 'user' ? styles.userTime : styles.mentorTime,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
        
        {shouldShowScheduler && (
          <TouchableOpacity
            style={styles.scheduleLessonButton}
            onPress={() => setShowLessonScheduler(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />
            <Text style={styles.scheduleLessonButtonText}>Choose Date & Time</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.mentorAvatar}>
            <Ionicons name="school" size={24} color={COLORS.textLight} />
          </View>
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorName}>{mentorName || 'Mentor'}</Text>
            <Text style={styles.mentorSkill}>{mentorSkill || 'Expert'}</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.online }]} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.mentorMessage]}>
              <View style={[styles.messageBubble, styles.mentorBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
                </View>
              </View>
            </View>
          )}
          
          {showLessonScheduler && renderLessonScheduler()}
          
          {showDatePicker && renderDatePicker()}
          {showTimePicker && renderTimePicker()}
          
          {showSuccessMessage && (
            <View style={styles.successMessageContainer}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
              <Text style={styles.successTitle}>Lesson Scheduled!</Text>
              <Text style={styles.successSubtitle}>Your lesson has been added to your dashboard</Text>
              <TouchableOpacity
                style={styles.dashboardButton}
                onPress={goToDashboard}
              >
                <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textSubtle}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() ? COLORS.textLight : COLORS.textSubtle}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginRight: 15,
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mentorDetails: {
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  mentorSkill: {
    fontSize: 14,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSubtle,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  mentorMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 5,
  },
  mentorBubble: {
    backgroundColor: COLORS.textLight,
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textLight,
  },
  mentorText: {
    color: COLORS.textDark,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  mentorTime: {
    color: COLORS.textSubtle,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSubtle,
    marginHorizontal: 2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    maxHeight: 100,
    paddingVertical: 5,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textSubtle,
  },
  scheduleLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  scheduleLessonButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  lessonSchedulerContainer: {
    backgroundColor: COLORS.textLight,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonSchedulerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  lessonSchedulerSubtitle: {
    fontSize: 14,
    color: COLORS.textSubtle,
    marginBottom: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  schedulerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.textSubtle,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  scheduleButtonDisabled: {
    backgroundColor: COLORS.textSubtle,
  },
  scheduleButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  successMessageContainer: {
    backgroundColor: COLORS.textLight,
    borderRadius: 16,
    padding: 24,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textSubtle,
    textAlign: 'center',
    marginBottom: 20,
  },
  dashboardButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dashboardButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: COLORS.textLight,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    marginBottom: 8,
  },
  pickerOptionText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  pickerOptionValue: {
    fontSize: 14,
    color: COLORS.textSubtle,
  },
  pickerCancel: {
    backgroundColor: COLORS.textSubtle,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  pickerCancelText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});