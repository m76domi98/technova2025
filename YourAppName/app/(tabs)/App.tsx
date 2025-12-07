import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Import the external screens
import LoginScreen from '..'; 
import SkillSelectionScreen from './SkillSelectionScreen'; 
import HomeSwipeScreen from './HomeSwipeScreen';

// --- Type Declarations for External Components (TEMPORARY FIX) ---
// Since we don't have the source code for the imported screens, 
// we declare their prop types here to satisfy the TypeScript compiler.
declare module '../' {
  // LoginScreen is imported as 'LoginScreen from '..''
  export default function LoginScreen(props: {
    onNavigateToSkills: () => void;
    onNavigateToLogin: () => void;
    onSignIn: () => void;
  }): JSX.Element;
}

declare module './SkillSelectionScreen' {
  // SkillSelectionScreen is imported as 'SkillSelectionScreen from './SkillSelectionScreen''
  export default function SkillSelectionScreen(props: {
    onGoBack: () => void;
  }): JSX.Element;
}

declare module './HomeSwipeScreen' {
  // HomeSwipeScreen is imported as 'HomeSwipeScreen from './HomeSwipeScreen''
  export default function HomeSwipeScreen(props: {
    onLogout: () => void;
  }): JSX.Element;
}
// -----------------------------------------------------------------


type Screen = 'login' | 'skills' | 'home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const navigateToSkills = () => {
    setCurrentScreen('skills');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };
  
  const navigateToHome = () => {
    console.log('User signed in/signed up. Navigating to Home/Swiping Screen.');
    setCurrentScreen('home');
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          // Type errors resolved by declaration above
          <LoginScreen 
            onNavigateToSkills={navigateToSkills} 
            onNavigateToLogin={navigateToLogin} 
            onSignIn={navigateToHome} 
          />
        );
      case 'skills':
        return (
          // Type error resolved by declaration above
          <SkillSelectionScreen 
            onGoBack={navigateToLogin} 
            // After skill selection, you might want to navigate to home or a confirmation screen
            // For now, let's assume 'continue' in SkillSelectionScreen would eventually lead to home
            // For this example, let's add a placeholder prop:
            // onSkillsSelected={navigateToHome} 
          />
        );
      case 'home':
        return (
          // Type error resolved by declaration above
          <HomeSwipeScreen 
            onLogout={navigateToLogin} // Allows logging out and returning to login screen
          />
        );
      default:
        return <View style={styles.container}><Text>Error: Unknown Screen</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
