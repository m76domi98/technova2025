import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#7B42F6',
  secondary: '#A5B5FF',
  background: '#F0F3FF',
  textDark: '#333333',
  textLight: '#FFFFFF',
  inputBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  shadowColor: '#000000',
  wavePrimary: '#7B42F6',
  waveSecondary: '#A5B5FF',
};

const AboutScreen = () => {
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [serviceFee, setServiceFee] = useState('');
  const [selectedMentoringStyles, setSelectedMentoringStyles] = useState<string[]>([]);
  const [selectedServiceModes, setSelectedServiceModes] = useState<string[]>([]);

  const mentoringStyles = ['Hands-on', 'Independent', 'Collaborative', 'Supportive'];
  const serviceModes = ['Hybrid', 'Online', 'In-person'];

  const isFormComplete = () => {
    return (
      name.length > 0 &&
      pronouns.length > 0 &&
      email.length > 0 &&
      country.length > 0 &&
      city.length > 0 &&
      serviceFee.length > 0 &&
      selectedMentoringStyles.length > 0 &&
      selectedServiceModes.length > 0
    );
  };

  const handleMentoringStyleSelection = (style: string) => {
    if (selectedMentoringStyles.includes(style)) {
      setSelectedMentoringStyles(selectedMentoringStyles.filter((s) => s !== style));
    } else {
      setSelectedMentoringStyles([...selectedMentoringStyles, style]);
    }
  };

  const handleServiceModeSelection = (mode: string) => {
    if (selectedServiceModes.includes(mode)) {
      setSelectedServiceModes(selectedServiceModes.filter((m) => m !== mode));
    } else {
      setSelectedServiceModes([...selectedServiceModes, mode]);
    }
  };

  const handleFinish = () => {
    if (isFormComplete()) {
      console.log('User profile completed:', {
        name,
        pronouns,
        email,
        country,
        city,
        serviceFee,
        selectedMentoringStyles,
        selectedServiceModes,
      });
      router.replace('/(tabs)/Dashboard'); // Navigate to main app
    } else {
      console.log('Please fill out all fields.');
    }
  };

  return (
    <>
      {/* Hide default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="light-content" backgroundColor={COLORS.wavePrimary} />

        {/* Decorative Waves */}
        <View style={styles.decorativeTopWave} />
        <View style={styles.decorativeSecondaryWave} />

        <View style={styles.contentContainer}>
          {/* Custom Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={COLORS.textLight} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About You</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Tell us about yourself! ✍️</Text>

            {/* Name & Pronouns */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pronouns</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., he/him, she/her, they/them"
                value={pronouns}
                onChangeText={setPronouns}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.twoColumnInput}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Country"
                  value={country}
                  onChangeText={setCountry}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

            {/* Service Fee */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Budget / Service Fee</Text>
              <TextInput
                style={styles.input}
                placeholder="$0.00 / hr"
                value={serviceFee}
                onChangeText={setServiceFee}
                keyboardType="numeric"
              />
            </View>

            {/* Mentoring Style */}
            <View style={styles.optionGroup}>
              <Text style={styles.inputLabel}>Mentoring Style</Text>
              <View style={styles.buttonRow}>
                {mentoringStyles.map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.optionButton,
                      selectedMentoringStyles.includes(style) && styles.optionButtonActive,
                    ]}
                    onPress={() => handleMentoringStyleSelection(style)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedMentoringStyles.includes(style) && styles.optionButtonTextActive,
                      ]}
                    >
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Service Mode */}
            <View style={styles.optionGroup}>
              <Text style={styles.inputLabel}>Service Mode</Text>
              <View style={styles.buttonRow}>
                {serviceModes.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.optionButton,
                      selectedServiceModes.includes(mode) && styles.optionButtonActive,
                    ]}
                    onPress={() => handleServiceModeSelection(mode)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedServiceModes.includes(mode) && styles.optionButtonTextActive,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.finishButton, !isFormComplete() && styles.finishButtonInactive]}
              onPress={handleFinish}
              disabled={!isFormComplete()}
            >
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: COLORS.background },
  decorativeTopWave: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height * 0.4,
    backgroundColor: COLORS.wavePrimary,
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
  },
  decorativeSecondaryWave: {
    position: 'absolute',
    top: -50,
    width: '100%',
    height: height * 0.35,
    backgroundColor: COLORS.waveSecondary,
    opacity: 0.6,
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
  },
  contentContainer: { flex: 1, paddingTop: height * 0.1, paddingHorizontal: 30, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textLight },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 30,
    padding: 25,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, color: COLORS.textDark },
  inputGroup: { width: '100%', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  input: { width: '100%', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.inputBackground, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', fontSize: 16, color: COLORS.textDark },
  twoColumnInput: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  optionGroup: { width: '100%', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%' },
  optionButton: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 25, borderWidth: 1, borderColor: COLORS.secondary, backgroundColor: COLORS.background, margin: 5 },
  optionButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionButtonText: { color: COLORS.textDark, fontSize: 14 },
  optionButtonTextActive: { color: COLORS.textLight },
  finishButton: { width: '100%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginTop: 20 },
  finishButtonInactive: { backgroundColor: COLORS.secondary, opacity: 0.6 },
  finishButtonText: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
});

export default AboutScreen;
