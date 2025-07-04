import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WordListItem from '../components/WordListItem';
import blocks from '../data/blocks.json';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function ExploreListScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const [progress, setProgress] = useState({});
  const [sectionMenuVisible, setSectionMenuVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const sectionRefs = useRef({});
  const yPositions = useRef({});
  const hasOpenedInitially = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, [])
  );

  useEffect(() => {
    if (!hasOpenedInitially.current) {
      hasOpenedInitially.current = true;
      setSectionMenuVisible(true);
    }
  }, []);

  const handleToggleStage1 = async (id) => {
    const current = getStage(progress, id);
    console.log(`⭐ Toggle Pressed — ID: ${id}, Current Stage: ${current}`);

    if (current >= 1) {
      Alert.alert(
        'Reset?',
        'Do you want to reset this word?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              await updateWordStage(id, 0, true);
              const updated = await loadProgress();
              setProgress(updated);
            },
          },
        ]
      );
    } else {
      await updateWordStage(id, 1);
      const updated = await loadProgress();
      setProgress(updated);
    }
  };

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

  const scrollToSection = (title) => {
    const node = sectionRefs.current[title];
    setShowHeader(false);
    setSectionMenuVisible(false);
    if (node && scrollRef.current) {
      node.measureLayout(
        scrollRef.current,
        (x, y) => {
          scrollRef.current.scrollTo({ y: y + 35, animated: true });
          setTimeout(() => setShowHeader(true), 600);
        },
        () => {}
      );
    }
  };

  const handleScroll = (event) => {
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

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.topBar} onPress={() => setSectionMenuVisible(true)}>
          <Text style={styles.topBarText}>{showHeader ? activeSection || 'Words' : ''}</Text>
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
                <Text style={styles.headerText}>{title}</Text>
              </View>
              {groupedBlocks[title].map((item) => (
                <WordListItem
                  key={item.id}
                  word={item}
                  wordStage={getStage(progress, item.id)}
                  onToggleFavorite={() => handleToggleStage1(item.id)}
                  onPress={() => {
                    const index = orderedWords.findIndex((w) => w.id === item.id);
                    if (index !== -1) {
                      navigation.push('WordRecord', {
                        words: orderedWords,
                        index,
                        mode: 'explore',
                      });
                    } else {
                      console.warn('Word not found in ordered list:', item.id);
                    }
                  }}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        <Modal
          visible={sectionMenuVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setSectionMenuVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {sectionTitles.map((title) => (
                <Pressable key={title} onPress={() => scrollToSection(title)}>
                  <Text style={styles.modalItem}>{title}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setSectionMenuVisible(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalItem: {
    fontSize: 18,
    color: 'white',
    paddingVertical: 10,
    textAlign: 'center',
  },
  modalClose: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 16,
    textAlign: 'center',
  },
});
