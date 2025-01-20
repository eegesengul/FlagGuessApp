import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../constants/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const { language, setLanguage, translations } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError(translations.fillAllFields || 'Please fill in all fields.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (err) {
      let errorMessage = translations.loginFailed || 'Login failed.';
      if (err.code === 'auth/user-not-found') {
        errorMessage += translations.emailNotRegistered || ' Email address is not registered.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage += translations.wrongPassword || ' Incorrect password.';
      }
      Alert.alert(translations.loginError || 'Login Error', errorMessage);
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

      <Text style={[styles.title, { color: theme.text }]}>{translations.login || 'Login'}</Text>
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={handleLogin}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>{translations.login || 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.link, { color: theme.link }]}>{translations.forgotPassword || 'Forgot Password?'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.link, { color: theme.link }]}>
          {translations.registerRedirect || "Don't have an account? Register"}
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

export default LoginScreen;
