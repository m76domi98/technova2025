import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#7B42F6',
  secondary: '#A5B5FF',
  background: '#FFFFFF',
  textDark: '#333333',
  textLight: '#FFFFFF',
  textGray: '#666666',
  cardBackground: '#FFFFFF',
  shadowColor: '#000000',
};

export type Mentor = {
  id: string;
  name: string;
  service: string;
  fee: number;
  location: string;
  mode: "Remote" | "Hybrid" | "In-person";
  description: string;
  photo: string;
};

type MentorCardProps = {
  mentor?: Mentor; // Make mentor optional to handle cases where it might be undefined
};

const MentorCard: React.FC<MentorCardProps> = ({ mentor }) => {
  // Defensive programming: check if mentor is a valid object before rendering
  if (!mentor) {
    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>Mentor data not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: mentor.photo }} style={styles.photo} />
      {/* Black, semi-transparent overlay for text readability */}
      <View style={styles.overlay} /> 
      <View style={styles.headerInfo}>
        <Text style={styles.name}>{mentor.name}</Text>
        <Text style={styles.service}>{mentor.service}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.description} numberOfLines={3}>{mentor.description}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
            <Text style={styles.metaText}>${mentor.fee} / hr</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={styles.metaText}>{mentor.location}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaItem}>
                <MaterialCommunityIcons 
                    name={
                        mentor.mode === "Remote" ? "laptop" : 
                        mentor.mode === "In-person" ? "account-group-outline" : 
                        "calendar-sync-outline"
                    } 
                    size={18} 
                    color={COLORS.primary} 
                />
                <Text style={styles.metaText}>{mentor.mode}</Text>
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: height * 0.65,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBackground,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: 'absolute',
  },
  photo: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerInfo: {
    position: 'absolute',
    bottom: height * 0.35 - 50,
    left: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  service: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: '500',
    marginTop: 5,
  },
  detailContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 5,
  },
  errorCard: {
    // Style for the placeholder card when data is missing
    width: width * 0.9,
    height: height * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    borderRadius: 20,
    padding: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MentorCard;