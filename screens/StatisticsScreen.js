import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { auth, db } from '../constants/firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function StatisticsScreen({ navigation }) {
  const { theme } = useTheme();
  const { translations } = useLanguage();

  const [firebaseStatistics, setFirebaseStatistics] = useState(null);
  const [loadingStatistics, setLoadingStatistics] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Kullanıcı istatistiklerini Firestore'dan çek
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoadingStatistics(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setFirebaseStatistics(userDocSnap.data().statistics);
          } else {
            Alert.alert(translations.noStatistics, translations.noStatisticsDetails);
          }
        } else {
          Alert.alert(translations.error, translations.userNotLoggedIn);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        Alert.alert(translations.error, translations.fetchError);
      } finally {
        setLoadingStatistics(false);
      }
    };

    fetchStatistics();
  }, []);

  // Liderlik tablosunu Firestore'dan çek
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const leaderboardRef = collection(db, 'leaderboard');
        const q = query(leaderboardRef, orderBy('highestScore', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        const leaderboardData = [];
        querySnapshot.forEach((doc) => {
          leaderboardData.push(doc.data());
        });

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        Alert.alert(translations.error, translations.leaderboardFetchError);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const calculateAccuracy = () => {
    if (firebaseStatistics) {
      const correct = firebaseStatistics.correctGuesses || 0;
      const incorrect = firebaseStatistics.incorrectGuesses || 0;
      const totalGuesses = correct + incorrect;
      if (totalGuesses === 0) return 0;
      return ((correct / totalGuesses) * 100).toFixed(2); // Yüzde olarak döner
    }
    return 0;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Geri Dön Butonu */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>{translations.statistics}</Text>

      {/* Kullanıcı İstatistikleri */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{translations.personalStats}</Text>
        {loadingStatistics ? (
          <ActivityIndicator size="large" color={theme.text} />
        ) : firebaseStatistics ? (
          <>
            <Text style={[styles.text, { color: theme.text }]}>
              {translations.score}: {firebaseStatistics.score || 0}
            </Text>
            <Text style={[styles.text, { color: theme.text }]}>
              {translations.gamesPlayed}: {firebaseStatistics.gamesPlayed || 0}
            </Text>
            <Text style={[styles.text, { color: theme.text }]}>
              {translations.highestScore}: {firebaseStatistics.highestScore || 0}
            </Text>
            <Text style={[styles.text, { color: theme.text }]}>
              {translations.correctGuesses}: {firebaseStatistics.correctGuesses || 0}
            </Text>
            <Text style={[styles.text, { color: theme.text }]}>
              {translations.incorrectGuesses}: {firebaseStatistics.incorrectGuesses || 0}
            </Text>
            <Text style={[styles.text, { color: theme.text }]}>
              {translations.accuracy}: %{calculateAccuracy()}
            </Text>
          </>
        ) : (
          <Text style={[styles.text, { color: theme.text }]}>{translations.noStatistics}</Text>
        )}
      </View>

      {/* Liderlik Tablosu */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{translations.leaderboard}</Text>
        {loadingLeaderboard ? (
          <ActivityIndicator size="large" color={theme.text} />
        ) : leaderboard.length === 0 ? (
          <Text style={[styles.text, { color: theme.text }]}>{translations.noLeaderboardData}</Text>
        ) : (
          leaderboard.map((user, index) => (
            <Text key={index} style={[styles.text, { color: theme.text }]}>
              {index + 1}. {user.username || translations.anonymous} - {translations.highestScore}: {user.highestScore || 0}
            </Text>
          ))
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
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginVertical: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
});
