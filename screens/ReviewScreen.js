import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WordListItem from '../components/WordListItem';
import { useTargetLang } from '../context/TargetLangContext';
import blocks from '../data/blocks.json';
import { getDynamicWordFields } from '../utils/getDynamicWordFields';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function ReviewScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const yPositions = useRef({});
  const suppressScroll = useRef(false);
  const [progress, setProgress] = useState({});
  const [activeSection, setActiveSection] = useState('');
  const { targetLang } = useTargetLang(); // ✅ added

  useFocusEffect(
    useCallback(() => {
      loadProgress().then((next) => {
        setProgress((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(next)) {
            return next;
          }
          return prev;
        });
      });
    }, [])
  );

  const stage4Blocks = blocks.filter((b) => getStage(progress, b.id) === 4);
  const groupedBlocks = stage4Blocks.reduce((acc, word) => {
    const type = word.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(word);
    return acc;
  }, {});

  Object.keys(groupedBlocks).forEach((type) => {
    if (type.toLowerCase() === 'number') {
      groupedBlocks[type].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    } else {
      groupedBlocks[type].sort((a, b) => a.english.localeCompare(b.english));
    }
  });

  const sectionTitles = Object.keys(groupedBlocks).sort();
  const orderedWords = sectionTitles.flatMap((title) => groupedBlocks[title]);

  const handleScroll = (event) => {
    if (suppressScroll.current) return;
    const y = event.nativeEvent.contentOffset.y;
    let current = '';
    for (let i = sectionTitles.length - 1; i >= 0; i--) {
      const title = sectionTitles[i];
      const yPos = yPositions.current[title];
      if (y >= yPos - 40) {
        current = title;
        break;
      }
    }
    setActiveSection(current);
  };

  const refreshProgress = async () => {
    const updated = await loadProgress();
    setProgress(updated);
  };

  const handleResetSection = async (title) => {
    const words = groupedBlocks[title] || [];

    Alert.alert(
      'Reset progress?',
      `This will set all words in "${title}" back to stage 0.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            for (const word of words) {
              await updateWordStage(word.id, 0, true);
            }
            await refreshProgress();
          },
        },
      ]
    );
  };

  const handleUpdateProgress = async (newProgress) => {
    suppressScroll.current = true;
    setProgress(newProgress);
    requestAnimationFrame(() => {
      setTimeout(() => {
        suppressScroll.current = false;
      }, 150);
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.topBar}>
          <Text style={styles.topBarText}>{activeSection || 'Review'}</Text>
        </TouchableOpacity>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.listContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {sectionTitles.map((title) => (
            <View key={title}>
              <View
                ref={(ref) => {
                  if (ref && scrollRef.current) {
                    sectionRefs.current[title] = ref;
                    ref.measureLayout(
                      scrollRef.current,
                      (x, y) => {
                        yPositions.current[title] = y;
                      },
                      () => {}
                    );
                  }
                }}
                style={styles.headerContainer}
              >
                <View style={styles.headerRow}>
                  <Text style={styles.headerText}>{title}</Text>
                  <TouchableOpacity onPress={() => handleResetSection(title)}>
                    <Text style={styles.tickText}>✗</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {groupedBlocks[title].map((item) => {
                const { foreignText, audio } = getDynamicWordFields(item, targetLang); // ✅ dynamic fields

                return (
                  <WordListItem
                    key={item.id}
                    word={{
                      ...item,
                      foreign: foreignText,
                      audio,
                    }}
                    wordStage={getStage(progress, item.id)}
                    onUpdateProgress={handleUpdateProgress}
                    onPress={() => {
                      const index = orderedWords.findIndex((w) => w.id === item.id);
                      if (index !== -1) {
                        navigation.push('ReviewWord', {
                          words: orderedWords,
                          index,
                          mode: 'review',
                        });
                      }
                    }}
                    showImage={false}
                  />
                );
              })}
            </View>
          ))}

          {orderedWords.length === 0 && (
            <Text style={styles.empty}>No words at Stage 4 yet</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
  },
  topBar: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  topBarText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  listContainer: {
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textTransform: 'capitalize',
  },
  tickText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  empty: {
    color: 'gray',
    fontSize: 18,
    marginTop: 40,
    textAlign: 'center',
  },
});
