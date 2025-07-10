import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WordListItem from '../components/WordListItemLite';
import blocks from '../data/blocks.json';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function ExploreListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const yPositions = useRef({});
  const suppressScroll = useRef(false);
  const hasScrolledToType = useRef(false);
  const [progress, setProgress] = useState({});
  const [activeSection, setActiveSection] = useState('');

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

  const groupedBlocks = blocks.reduce((acc, word) => {
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

  useEffect(() => {
    const scrollToType = route.params?.scrollToType;
    if (!scrollToType || hasScrolledToType.current) return;

    const tryScroll = () => {
      const y = yPositions.current[scrollToType];
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y: y + 35, animated: true });
        hasScrolledToType.current = true;
      }
    };

    const timeout = setTimeout(tryScroll, 500);
    return () => clearTimeout(timeout);
  }, [route.params, progress]);

  const refreshProgress = async () => {
    const updated = await loadProgress();
    setProgress(updated);
  };

  const handleToggleSection = async (title) => {
    console.log(`\u25B6\uFE0F handleToggleSection called for: ${title}`);
    const sectionWords = groupedBlocks[title] || [];

    const isFullySelected =
      sectionWords.length > 0 &&
      sectionWords.every((word) => getStage(progress, word.id) >= 2);

    for (const word of sectionWords) {
      const current = getStage(progress, word.id);
      const newStage = isFullySelected ? 0 : 2;

      if (current !== newStage) {
        await updateWordStage(word.id, newStage, true);
      }
    }

    await refreshProgress();
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.topBar}>
          <Text style={styles.topBarText}>{activeSection || 'Words'}</Text>
        </TouchableOpacity>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.listContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {sectionTitles.map((title) => {
            const sectionWords = groupedBlocks[title] || [];
            const isFullySelected =
              sectionWords.length > 0 &&
              sectionWords.every((word) => getStage(progress, word.id) >= 2);

            return (
              <View key={title}>
                <View
                  ref={(ref) => {
                    if (ref && scrollRef.current) {
                      sectionRefs.current[title] = ref;
                      try {
                        ref.measureLayout(
                          scrollRef.current,
                          (x, y) => {
                            yPositions.current[title] = y;
                          },
                          () => {}
                        );
                      } catch (e) {
                        console.warn(`measureLayout failed for ${title}`, e);
                      }
                    }
                  }}
                  style={styles.headerContainer}
                >
                  <View style={styles.headerRow}>
                    <Text style={styles.headerText}>{title}</Text>
                    <TouchableOpacity onPress={() => handleToggleSection(title)}>
                      <Text style={styles.tickText}>{isFullySelected ? '✗' : '✓'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {sectionWords.map((item) => (
                  <WordListItem
                    key={item.id}
                    word={item}
                    wordStage={getStage(progress, item.id)}
                    onUpdateProgress={setProgress}
                    onPress={() => {
                      const index = orderedWords.findIndex((w) => w.id === item.id);
                      if (index !== -1) {
                        navigation.push('WordRecord', {
                          words: orderedWords,
                          index,
                          mode: 'explore',
                        });
                      }
                    }}
                  />
                ))}
              </View>
            );
          })}
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
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
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
});
