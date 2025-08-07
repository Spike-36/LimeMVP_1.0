import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WordListItem from '../components/WordListItem'; // ✅ shared version only
import { useTargetLang } from '../context/TargetLangContext';
import blocks from '../data/blocks.json';
import { getDynamicWordFields } from '../utils/getDynamicWordFields';
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
  const animRefs = useRef({});
  const { targetLang } = useTargetLang();

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
    if (type.toLowerCase() === 'numbers') {
      groupedBlocks[type].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    } else {
      groupedBlocks[type].sort((a, b) => a.english.localeCompare(b.english));
    }
  });

  const priorityOrder = [
    'numbers',
    'place',
    'ingredients',
    'local ingredients',
    'things',
    'local dishes',
    'drinks',
    'speech',
    'concepts',
  ];
  const allTypes = Object.keys(groupedBlocks);
  const prioritized = priorityOrder.filter((t) => allTypes.includes(t));
  const leftovers = allTypes.filter((t) => !priorityOrder.includes(t)).sort();
  const sectionTitles = [...prioritized, ...leftovers];

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

    let attempts = 0;
    const maxAttempts = 10;
    const retryDelay = 200;

    const tryScroll = () => {
      const y = yPositions.current[scrollToType];
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y: y + 35, animated: true });
        hasScrolledToType.current = true;
        console.log(`✅ Scrolled to ${scrollToType} at y=${y}`);
      } else {
        if (attempts < maxAttempts) {
          attempts++;
          console.log(`⏳ Retry ${attempts}: waiting for y of ${scrollToType}`);
          setTimeout(tryScroll, retryDelay);
        } else {
          console.warn(`❌ Failed to scroll to ${scrollToType} after ${maxAttempts} attempts`);
        }
      }
    };

    tryScroll();
  }, [route.params, progress]);

  const refreshProgress = async () => {
    const updated = await loadProgress();
    setProgress(updated);
  };

  const triggerTickBounce = (title) => {
    const anim = animRefs.current[title];
    if (!anim) return;

    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggleSection = async (title) => {
    triggerTickBounce(title);
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

            if (!animRefs.current[title]) {
              animRefs.current[title] = new Animated.Value(1);
            }

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
                      <Animated.Text
                        style={[
                          styles.tickText,
                          { transform: [{ scale: animRefs.current[title] }] },
                        ]}
                      >
                        {isFullySelected ? '✗' : '✓'}
                      </Animated.Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {sectionWords.map((item) => {
                  const { foreignText, audio } = getDynamicWordFields(item, targetLang);

                  return (
                    <WordListItem
                      key={item.id}
                      word={{
                        ...item,
                        foreign: foreignText,
                        audio,
                      }}
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
                  );
                })}
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
