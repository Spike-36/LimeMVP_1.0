import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import blocks from '../data/blocks.json';
import { getStage, loadProgress } from '../utils/progressStorage';

export default function ReviewScreen() {
  const [reviewWords, setReviewWords] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchReviewWords = async () => {
        const progressMap = await loadProgress();
        console.log('📦 Review Progress Map:', progressMap);

        const filtered = blocks.filter((b) => {
          const stage = getStage(progressMap, b.id);
          if (stage === 4) {
            console.log(`✅ Including word ID: ${b.id}, Stage: ${stage}`);
            return true;
          }
          return false;
        });

        console.log('🔎 Found words at stage 4:', filtered.map((w) => w.id));
        setReviewWords(filtered);
      };

      fetchReviewWords();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Review Words (Stage 4)</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {reviewWords.map((word) => (
          <View key={word.id} style={styles.wordRow}>
            <Text style={styles.wordText}>{word.english || '—'}</Text>
            <Text style={styles.nativeText}>{word.foreign || '—'}</Text>
          </View>
        ))}
        {reviewWords.length === 0 && (
          <Text style={styles.empty}>No words at Stage 4 yet</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  wordRow: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  wordText: {
    color: '#fff',
    fontSize: 18,
  },
  nativeText: {
    color: '#aaa',
    fontSize: 16,
  },
  empty: {
    color: 'gray',
    fontSize: 18,
    marginTop: 40,
    textAlign: 'center',
  },
});
