import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useScore } from '../contexts/ScoreContext';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext'; // useLanguage import et

export default function StatisticsScreen({ navigation }) {
  const { theme } = useTheme();
  const { score } = useScore();
  const { language, translations } = useLanguage(); // translations'i al

  const totalGuesses = score.correct + score.incorrect;
  const accuracy = totalGuesses > 0 ? ((score.correct / totalGuesses) * 100).toFixed(2) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Geri Butonu */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>
        {translations.statistics} {/* Çevrilmiş başlık */}
      </Text>
      <Text style={[styles.text, { color: theme.text }]}>
        {translations.totalGuesses}: {totalGuesses}
      </Text>
      <Text style={[styles.text, { color: theme.text }]}>
        {translations.correctGuesses}: {score.correct}
      </Text>
      <Text style={[styles.text, { color: theme.text }]}>
        {translations.accuracy}: %{accuracy}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
