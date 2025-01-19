import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Tema kullanımı
import { useLanguage } from '../contexts/LanguageContext'; // useLanguage import et

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { language, translations } = useLanguage(); // translations'i al

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        {translations.app} {/* Çevrilmiş metni kullan */}
      </Text>

      {/* Kendi özelleştirilmiş butonumuzu kullandık */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonBackground }]}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          {translations.game}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonBackground }]}
        onPress={() => navigation.navigate('Statistics')}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          {translations.statistics}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonBackground }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          {translations.settings}
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
