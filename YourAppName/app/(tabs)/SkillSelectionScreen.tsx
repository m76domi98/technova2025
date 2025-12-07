import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Stack, router } from 'expo-router';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#7B42F6', 
  secondary: '#A5B5FF', 
  background: '#F0F3FF', 
  textDark: '#333333',
  textLight: '#FFFFFF',
  textGray: '#666',
  tagUnselected: '#E0E7FF',
};

const MAX_SKILLS = 5;

const SKILLS_DATA = [
  { id: '1', name: 'Cooking' },
  { id: '2', name: 'Crochet' },
  { id: '3', name: 'Coding (JS)' },
  { id: '4', name: 'Baking' },
  { id: '5', name: 'Gardening' },
  { id: '6', name: 'Painting' },
  { id: '7', name: 'Yoga' },
  { id: '8', name: 'Photography' },
  { id: '9', name: 'Financial Literacy' },
  { id: '10', name: 'Web Design' },
  { id: '11', name: 'Home Repair' },
  { id: '12', name: 'Knitting' },
];

export default function SkillSelectionScreen() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [otherSkill, setOtherSkill] = useState('');

  const handleSkillSelection = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter((name) => name !== skillName));
    } else if (selectedSkills.length < MAX_SKILLS) {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const addOtherSkill = () => {
    if (otherSkill.trim() === '' || selectedSkills.length >= MAX_SKILLS) return;
    if (!selectedSkills.includes(otherSkill.trim())) {
      setSelectedSkills([...selectedSkills, otherSkill.trim()]);
      setOtherSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const renderSkillTag = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = selectedSkills.includes(item.name);
    return (
      <TouchableOpacity
        style={[
          styles.skillTag,
          isSelected ? styles.selectedSkillTag : styles.unselectedSkillTag,
        ]}
        onPress={() => handleSkillSelection(item.name)}
        disabled={!isSelected && selectedSkills.length >= MAX_SKILLS}
      >
        <Text style={[styles.skillText, isSelected ? styles.selectedSkillText : styles.unselectedSkillText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skill Selection</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>What skills would you like to learn?</Text>
          <Text style={styles.subtitle}>
            Choose <Text style={{ fontWeight: 'bold' }}>{MAX_SKILLS}</Text> skills to match with potential teachers.
          </Text>
          <Text style={styles.counterText}>
            {selectedSkills.length}/{MAX_SKILLS} Selected
          </Text>

          {/* Selected Skill Bubbles */}
          <View style={styles.selectedSkillsContainer}>
            {selectedSkills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={styles.selectedBubble}
                onPress={() => removeSkill(skill)}
              >
                <Text style={styles.selectedBubbleText}>{skill} ×</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={SKILLS_DATA}
            renderItem={renderSkillTag}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContainer}
          />

          {/* Other Skill Input with Add Button */}
          <View style={styles.otherSkillRow}>
            <TextInput
              placeholder="Other skill..."
              style={styles.otherSkillInput}
              value={otherSkill}
              onChangeText={setOtherSkill}
              editable={selectedSkills.length < MAX_SKILLS}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                selectedSkills.length >= MAX_SKILLS || otherSkill.trim() === '' ? styles.addButtonDisabled : {},
              ]}
              onPress={addOtherSkill}
              disabled={selectedSkills.length >= MAX_SKILLS || otherSkill.trim() === ''}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedSkills.length === MAX_SKILLS
                ? styles.continueButtonActive
                : styles.continueButtonInactive,
            ]}
            disabled={selectedSkills.length !== MAX_SKILLS}
            onPress={() => router.push('/about')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  backButton: { padding: 10 },
  backButtonText: { fontSize: 24, color: COLORS.primary, fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textDark },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textDark, marginTop: 10, marginBottom: 5 },
  subtitle: { fontSize: 16, color: COLORS.textGray, marginBottom: 20 },
  counterText: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 10 },

  selectedSkillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  selectedBubble: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, margin: 5 },
  selectedBubbleText: { color: COLORS.textLight, fontWeight: '600', fontSize: 14 },

  gridContainer: { alignItems: 'center' },
  row: { justifyContent: 'space-around', width: width - 40 },
  skillTag: { flex: 1, margin: 8, paddingVertical: 18, paddingHorizontal: 10, borderRadius: 25, borderWidth: 2, alignItems: 'center', justifyContent: 'center', minWidth: 140 },
  unselectedSkillTag: { backgroundColor: COLORS.tagUnselected, borderColor: 'transparent' },
  selectedSkillTag: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  skillText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  unselectedSkillText: { color: COLORS.textDark },
  selectedSkillText: { color: COLORS.textLight },

  otherSkillRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginHorizontal: 8 },
  otherSkillInput: { flex: 1, backgroundColor: COLORS.tagUnselected, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 16, color: COLORS.textDark, borderWidth: 1, borderColor: COLORS.primary },
  addButton: { marginLeft: 10, paddingVertical: 15, paddingHorizontal: 20, backgroundColor: COLORS.primary, borderRadius: 25 },
  addButtonDisabled: { backgroundColor: COLORS.secondary, opacity: 0.6 },
  addButtonText: { color: COLORS.textLight, fontWeight: '600', fontSize: 16 },

  continueButton: { marginTop: 40, paddingVertical: 18, borderRadius: 15, alignItems: 'center', width: '100%' },
  continueButtonActive: { backgroundColor: COLORS.primary },
  continueButtonInactive: { backgroundColor: COLORS.secondary, opacity: 0.6 },
  continueButtonText: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
});
