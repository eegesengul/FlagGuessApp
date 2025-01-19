import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext'; // useLanguage import et
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, translations } = useLanguage(); // translations'i de al

  const [isLanguagePickerVisible, setIsLanguagePickerVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Geri Butonu */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>
        {translations.settings} {/* Çevrilmiş metni kullan */}
      </Text>

      {/* Tema Değiştirme */}
      <View style={styles.settingSection}>
        <TouchableOpacity onPress={toggleTheme}>
          <Text style={[styles.toggleText, { color: theme.text }]}>
            {translations.themeChange}: {theme.background === '#FFFFFF' ? 'Koyu Mod' : 'Açık Mod'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dil Seçimi */}
      <View style={styles.languageSection}>
        <TouchableOpacity onPress={() => setIsLanguagePickerVisible(!isLanguagePickerVisible)}>
          <Text style={[styles.label, { color: theme.text }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 80, // Daha aşağıda gösterir
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 18,
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    marginTop: 20,
  },
  settingSection: {
    marginBottom: 20,
  },
  languageSection: {
    width: '100%',
    alignItems: 'center',
  },
  pickerContainer: {
    width: 200,
    marginTop: 10,
  },
  picker: {
    width: '100%',
    height: 50,
  },
});
