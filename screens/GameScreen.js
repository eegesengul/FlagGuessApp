import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../constants/firebase';
import { doc, updateDoc, increment, getDoc, collection, setDoc } from 'firebase/firestore';

export default function GameScreen({ navigation }) {
  const { theme } = useTheme();
  const { language, translations } = useLanguage();

  const [country, setCountry] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchCountryAndOptions();
    fetchCurrentScore();
  }, [language]);

  const fetchCurrentScore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setScore(data.statistics?.score || 0);
      }
    } catch (error) {
      console.error('Error fetching current score:', error);
    }
  };

  const fetchCountryAndOptions = async (retryCount = 0) => {
    if (retryCount === 0) setLoading(true);
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all', { timeout: 15000 });
      const countries = response.data;

      if (countries.length === 0) {
        throw new Error(translations.apiError);
      }

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
      setCorrectAnswer(translateCountryName(correctCountry));
    } catch (error) {
      if (retryCount < 3) {
        setTimeout(() => fetchCountryAndOptions(retryCount + 1), 2000 * (retryCount + 1));
      } else {
        Alert.alert(translations.apiError, translations.apiErrorDetails);
        setLoading(false);
      }
    } finally {
      if (retryCount === 0) setLoading(false);
    }
  };

  const translateCountryName = (country) => {
    if (language === 'tr') {
      return country.translations?.tur?.official || country.name.common;
    }
    return country.name.common;
  };

  const updateUserStatistics = async (isCorrect) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) return;

      const userData = userDocSnap.data();
      const correctIncrement = isCorrect ? 1 : 0;
      const incorrectIncrement = isCorrect ? 0 : 1;
      const scoreIncrement = isCorrect ? 5 : -3;

      await updateDoc(userDocRef, {
        'statistics.gamesPlayed': increment(1),
        'statistics.correctGuesses': increment(correctIncrement),
        'statistics.incorrectGuesses': increment(incorrectIncrement),
        'statistics.highestScore': Math.max(
          userData.statistics.highestScore || 0,
          (userData.statistics.score || 0) + scoreIncrement
        ),
        'statistics.score': increment(scoreIncrement),
      });

      setScore((prevScore) => prevScore + scoreIncrement);

      const leaderboardRef = collection(db, 'leaderboard');
      await setDoc(doc(leaderboardRef, user.uid), {
        userId: user.uid,
        username: userData.username || translations.anonymous,
        score: (userData.statistics.score || 0) + scoreIncrement,
        highestScore: Math.max(
          userData.statistics.highestScore || 0,
          (userData.statistics.score || 0) + scoreIncrement
        ),
      });
    } catch (error) {
      console.error('Error updating statistics or leaderboard:', error);
    }
  };

  const handleGuess = async (selectedCountry) => {
    const isCorrect = selectedCountry === correctAnswer;
    await updateUserStatistics(isCorrect);
    setSelectedOption(selectedCountry);
    setShowCorrectAnswer(true);

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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.score, { color: theme.text }]}>{translations.currentScore}: {score}</Text>

      <Image source={{ uri: country.flags?.png }} style={[styles.flag, { borderColor: theme.text }]} />
      <Text style={[styles.question, { color: theme.text }]}>{translations.question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const optionName = translateCountryName(option);
          const isCorrectOption = optionName === correctAnswer;
          const isSelectedOption = optionName === selectedOption;

          return (
            <TouchableOpacity
              key={option.cca3 || option.name.common}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelectedOption
                    ? isCorrectOption
                      ? theme.correctButton
                      : theme.incorrectButton
                    : showCorrectAnswer && isCorrectOption
                    ? theme.correctButton
                    : theme.buttonBackground,
                },
              ]}
              onPress={() => handleGuess(optionName)}
              disabled={!!selectedOption}
            >
              <Text style={[styles.optionText, { color: theme.buttonText }]}>{optionName}</Text>
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
  score: {
    fontSize: 20,
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
