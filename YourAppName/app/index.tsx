import { router } from 'expo-router';
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
import { useAuth } from '../contexts/AuthContext';

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#7B42F6', 
  secondary: '#A5B5FF', 
  background: '#FFFFFF', 
  textDark: '#333333',
  textLight: '#FFFFFF',
  inputBackground: '#F0F3FF',
  wavePrimary: '#7B42F6',
  waveSecondary: '#A5B5FF',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/(tabs)/Dashboard');
    }
  }, [isAuthenticated, authLoading]);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login(email.trim(), password);
      // Navigate to dashboard after successful login
      router.replace('/(tabs)/Dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    // Navigate to the comprehensive signup form
    router.push('/(tabs)/SignupForm');
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <View style={[styles.scrollContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textDark }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.wavePrimary} />
      
      {/* Decorative Wave Background (Purple) */}
      <View style={styles.decorativeTopWave} />
      {/* Secondary Wave (Blue/Purple blend) */}
      <View style={styles.decorativeSecondaryWave} />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Sign in to your Registered Account.</Text>

        {/* --- Card Container for Form --- */}
        <View style={styles.card}>
          
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="************"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.toggleButton}
              >
                <Text style={{ color: COLORS.primary, fontSize: 14 }}>
                  {isPasswordVisible ? 'HIDE' : 'SHOW'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {/* SIGN UP Button */}
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton, isLoading && styles.disabledButton]} 
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>SIGN UP</Text>
              )}
            </TouchableOpacity>

            {/* SIGN IN Button */}
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]} 
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.textLight} size="small" />
              ) : (
                <Text style={[styles.buttonText, styles.primaryButtonText]}>SIGN IN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  decorativeTopWave: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height * 0.45,
    backgroundColor: COLORS.wavePrimary,
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
  },
  decorativeSecondaryWave: {
    position: 'absolute',
    top: -50,
    width: '100%',
    height: height * 0.4,
    backgroundColor: COLORS.waveSecondary,
    opacity: 0.6,
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
  },
  contentContainer: {
    flex: 1,
    paddingTop: height * 0.15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 30,
    padding: 25,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.textDark,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.textDark,
  },
  toggleButton: {
    paddingRight: 20,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  secondaryButton: {
    backgroundColor: COLORS.inputBackground,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: COLORS.textLight,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
});