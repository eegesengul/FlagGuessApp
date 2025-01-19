import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useScore } from '../contexts/ScoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export default function GameScreen({ navigation }) {
  const { theme } = useTheme();
  const { score, setScore } = useScore();
  const { language, translations } = useLanguage();

  const [country, setCountry] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    fetchCountryAndOptions();
  }, [language]);

  const fetchCountryAndOptions = async (retryCount = 0) => {
    if (retryCount === 0) setLoading(true); // İlk denemede yükleme durumunu başlat
  
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all', {
        timeout: 15000, // Timeout süresi 15 saniye
      });
  
      const countries = response.data;
      const correctCountry = countries[Math.floor(Math.random() * countries.length)];
  
      const incorrectCountries = new Set();
      while (incorrectCountries.size < 3) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        if (randomCountry.name.common !== correctCountry.name.common) {
          incorrectCountries.add(randomCountry);
        }
      }
  
      const allOptions = [...incorrectCountries, correctCountry].sort(() => Math.random() - 0.5);
      setCountry(correctCountry);
      setOptions(allOptions);
      setSelectedOption(null);
  
      // Doğru cevabı seçilen dilde ayarla
      setCorrectAnswer(translateCountryName(correctCountry));
    } catch (error) {
      if (retryCount < 3) {
        setTimeout(() => fetchCountryAndOptions(retryCount + 1), 2000 * (retryCount + 1)); // Yeniden deneme
      } else {
        alert('API bağlantısında sorun oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
        setLoading(false); // Hata alındığında yükleme durumu kapatılır
      }
    } finally {
      if (retryCount === 0) setLoading(false); // Yükleme durumunu ilk istekte kapat
    }
  };

  const translateCountryName = (country) => {
    if (language === 'tr') {
      return country.translations?.tur?.official || country.name.common; // Türkçe çeviri varsa al
    }
    return country.name.common; // İngilizce ad
  };

  const handleGuess = (selectedCountry) => {
    setSelectedOption(selectedCountry);
    setShowCorrectAnswer(true);

    if (selectedCountry === correctAnswer) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    setTimeout(() => {
      setShowCorrectAnswer(false);
      fetchCountryAndOptions();
    }, 1000);
  };

  if (loading || !country) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Image source={{ uri: country.flags?.png }} style={[styles.flag, { borderColor: theme.text }]} />
      <Text style={[styles.question, { color: theme.text }]}>
        {translations.question}
      </Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const optionName = translateCountryName(option); // Çevrilmiş ülke adı
          const isCorrectOption = optionName === correctAnswer; // Doğru cevabı kontrol et
          const isSelectedOption = optionName === selectedOption; // Seçimi kontrol et

          return (
            <TouchableOpacity
              key={option.cca3 || option.name.common} // Benzersiz key kullanımı
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    isSelectedOption
                      ? isCorrectOption
                        ? theme.correctButton // Seçilen doğru cevap için yeşil
                        : theme.incorrectButton // Yanlış cevap için kırmızı
                      : showCorrectAnswer && isCorrectOption
                      ? theme.correctButton // Doğru cevap yeşil
                      : theme.buttonBackground,
                },
              ]}
              onPress={() => handleGuess(optionName)}
              disabled={!!selectedOption} // Bir seçim yapıldıysa butonları devre dışı bırak
            >
              <Text style={[styles.optionText, { color: theme.buttonText }]}>
                {optionName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    top: 80,
    left: 20,
  },
  flag: {
    width: 200,
    height: 100,
    marginBottom: 20,
    borderWidth: 2,
    borderRadius: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '90%',
    justifyContent: 'space-around',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});