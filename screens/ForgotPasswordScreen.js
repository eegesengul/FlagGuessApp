import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../constants/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const ForgotPasswordScreen = ({ navigation }) => {
  const { language, setLanguage, translations } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError(translations.enterEmail || 'Please enter your email.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        translations.resetEmailSent || 'Password Reset Email Sent',
        translations.checkEmail || 'Please check your email to reset your password.'
      );
      navigation.navigate('Login');
    } catch (err) {
      let errorMessage = translations.resetFailed || 'Password reset failed.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = translations.emailNotRegistered || 'This email is not registered.';
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

      <Text style={[styles.title, { color: theme.text }]}>{translations.forgotPassword || 'Forgot Password?'}</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.inputBorder }]}
        placeholder={translations.email || 'Email'}
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={setEmail}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={handlePasswordReset}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>{translations.resetPassword || 'Reset Password'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.link, { color: theme.link }]}>{translations.backToLogin || 'Back to Login'}</Text>
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

export default ForgotPasswordScreen;
