import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../constants/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const RegisterScreen = ({ navigation }) => {
  const { language, setLanguage, translations } = useLanguage();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validateInputs = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return translations.fillAllFields || 'Please fill in all fields.';
    }
    if (username.length < 3) {
      return translations.usernameMinLength || 'Username must be at least 3 characters.';
    }
    if (!email.includes('@') || !email.includes('.')) {
      return translations.validEmail || 'Enter a valid email address.';
    }
    if (password.length < 6) {
      return translations.passwordMinLength || 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      return translations.passwordMismatch || 'Passwords do not match.';
    }
    return null;
  };

  const handleRegister = async () => {
    setError('');
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        statistics: {
          gamesPlayed: 0,
          correctGuesses: 0,
          incorrectGuesses: 0,
          score: 0,
          highestScore: 0,
        },
      });

      Alert.alert(
        translations.registerSuccess || 'Registration Successful',
        translations.accountCreated || 'Your account has been created successfully!',
        [{ text: translations.ok || 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      let errorMessage = translations.registerError || 'An error occurred during registration.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = translations.emailInUse || 'This email address is already in use.';
      }
      setError(errorMessage);
    }
  };

  const handleLanguageChange = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'tr' ? 'en' : 'tr'));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dil Değiştirme Butonu */}
      <TouchableOpacity style={styles.languageToggle} onPress={handleLanguageChange}>
        <Text style={[styles.languageText, { color: theme.text }]}>{language === 'tr' ? 'EN' : 'TR'}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>{translations.register || 'Register'}</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.inputBorder }]}
        placeholder={translations.username || 'Username'}
        placeholderTextColor={theme.placeholder}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.inputBorder }]}
        placeholder={translations.email || 'Email'}
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.inputBorder }]}
        placeholder={translations.password || 'Password'}
        placeholderTextColor={theme.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={[styles.input, { borderColor: theme.inputBorder }]}
        placeholder={translations.confirmPassword || 'Confirm Password'}
        placeholderTextColor={theme.placeholder}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={handleRegister}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>{translations.register || 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.link }]}>
          {translations.loginRedirect || 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  languageToggle: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#ddd',
    padding: 8,
    borderRadius: 5,
  },
  languageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RegisterScreen;
