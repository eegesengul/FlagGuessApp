import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { auth, db } from '../constants/firebase';
import { signOut, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, translations } = useLanguage();

  const [isLanguagePickerVisible, setIsLanguagePickerVisible] = useState(false);

  // İstatistikleri sıfırla
  const resetStatistics = async () => {
    Alert.alert(
      translations.resetStats,
      translations.resetStatsConfirm,
      [
        { text: translations.cancel, style: 'cancel' },
        {
          text: translations.confirm,
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;
  
              const userDocRef = doc(db, 'users', user.uid);
  
              // Kullanıcı verilerini sıfırla
              await updateDoc(userDocRef, {
                'statistics.gamesPlayed': 0,
                'statistics.correctGuesses': 0,
                'statistics.incorrectGuesses': 0,
                'statistics.score': 0,
              });
  
              // Liderlik tablosunu güncelle
              const leaderboardRef = doc(db, 'leaderboard', user.uid);
              await updateDoc(leaderboardRef, { score: 0 });
  
              Alert.alert(translations.resetStats, translations.resetStatsSuccess);
            } catch (error) {
              console.error('Error resetting statistics or leaderboard:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  // Şifre değiştir
  const changePassword = async () => {
    const newPassword = prompt(translations.newPasswordPrompt);
    if (newPassword) {
      try {
        const user = auth.currentUser;
        await updatePassword(user, newPassword);
        Alert.alert(translations.passwordChange, translations.passwordChangeSuccess);
      } catch (error) {
        console.error('Error changing password:', error.message);
      }
    }
  };

  // Hesaptan çıkış yap
  const logout = async () => {
    Alert.alert(
      translations.logout,
      translations.logoutConfirm,
      [
        { text: translations.cancel, style: 'cancel' },
        {
          text: translations.confirm,
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error signing out:', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Geri Butonu */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      {/* Ayarlar Başlığı */}
      <Text style={[styles.title, { color: theme.text }]}>{translations.settings}</Text>

      {/* Ayar Seçenekleri */}
      <View style={styles.optionsContainer}>
        {/* İstatistikleri Sıfırla */}
        <TouchableOpacity style={styles.optionButton} onPress={resetStatistics}>
          <Text style={[styles.optionText, { color: theme.text }]}>{translations.resetStats}</Text>
        </TouchableOpacity>

        {/* Tema Değiştirme */}
        <TouchableOpacity style={styles.optionButton} onPress={toggleTheme}>
          <Text style={[styles.optionText, { color: theme.text }]}>
            {translations.themeChange}: {theme.background === '#FFFFFF' ? 'Koyu Mod' : 'Açık Mod'}
          </Text>
        </TouchableOpacity>

        {/* Dil Seçimi */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setIsLanguagePickerVisible(!isLanguagePickerVisible)}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>
            {translations.languageSelection}: {language === 'tr' ? 'Türkçe' : 'English'}
          </Text>
        </TouchableOpacity>
        {isLanguagePickerVisible && (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.background }]}
              onValueChange={(value) => {
                setLanguage(value);
                setIsLanguagePickerVisible(false); // Kapatmak için
              }}
            >
              <Picker.Item label="Türkçe" value="tr" />
              <Picker.Item label="English" value="en" />
            </Picker>
          </View>
        )}
      </View>

      {/* Çıkış Yap */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.optionButton} onPress={logout}>
          <Text style={[styles.optionText, { color: theme.text }]}>{translations.logout}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100, // Başlık biraz aşağıda görünsün
    marginBottom: 30, // Seçenekler ile aralık
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
  },
  pickerContainer: {
    width: '80%',
    marginTop: 10,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  logoutSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
});
