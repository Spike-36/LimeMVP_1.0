import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function PracticeSpeakScreen() {
  const navigation = useNavigation();
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState({});
  const [pendingRemovalId, setPendingRemovalId] = useState(null);
  const [autoplay, setAutoplay] = useState(false);

  const soundRef = useRef(null);
  const autoplayTimer = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const current = shuffledBlocks[currentIndex];
  const currentStage = current?.id ? getStage(progress, current.id) : 0;

  const REVEAL_DELAY = 1500;
  const ENGLISH_DELAY = 1200;
  const THINK_DELAY = 2000;
  const JAPANESE_DELAY = 1000;
  const NEXT_DELAY = 1500;

  useFocusEffect(
    useCallback(() => {
      async function loadEligibleWords() {
        const progressMap = await loadProgress();
        const eligible = blocks.filter(b => getStage(progressMap, b.id) === 3);
        setProgress(progressMap);
        setShuffledBlocks(shuffleArray(eligible));
        setCurrentIndex(0);
        setPendingRemovalId(null);
      }
      loadEligibleWords();
    }, [])
  );

  useEffect(() => {
    if (!autoplay || !current) return;

    const runSequence = async () => {
      try {
        await new Promise(res => setTimeout(res, REVEAL_DELAY));

        if (current.audioEnglish && audioMap[current.audioEnglish]) {
          const { sound } = await Audio.Sound.createAsync(audioMap[current.audioEnglish]);
          await sound.playAsync();
        }

        await new Promise(res => setTimeout(res, THINK_DELAY));
        setShowAnswer(true);

        await new Promise(res => setTimeout(res, JAPANESE_DELAY));

        if (current.audio && audioMap[current.audio]) {
          const { sound } = await Audio.Sound.createAsync(audioMap[current.audio]);
          await sound.playAsync();
        }

        await new Promise(res => setTimeout(res, NEXT_DELAY));
        handleNext();
      } catch (err) {
        console.warn('❌ Autoplay error:', err.message);
      }
    };

    autoplayTimer.current = setTimeout(runSequence, 100);
    return () => clearTimeout(autoplayTimer.current);
  }, [currentIndex, autoplay]);

  useEffect(() => {
    if (!current?.audio || !showAnswer || autoplay) return;

    let isMounted = true;

    const loadAndPlay = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current.setOnPlaybackStatusUpdate(null);
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(audioMap[current.audio]);
        soundRef.current = sound;

        if (isMounted) {
          await sound.playAsync();
        }
      } catch (err) {
        console.warn('❌ Speak audio error:', err.message);
      }
    };

    loadAndPlay();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [current?.id, showAnswer]);

  const playAudio = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.replayAsync();
    } catch (err) {
      console.warn('⚠️ Replay failed:', err.message);
    }
  };

  const triggerTickAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAdvanceToStage4 = async () => {
    if (!current?.id || currentStage >= 4) return;

    triggerTickAnimation();

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (err) {
      console.warn('Haptics error:', err.message);
    }

    await updateWordStage(current.id, 4);
    const updated = await loadProgress();
    setProgress(updated);
    setPendingRemovalId(current.id);
  };

  const handleNext = () => {
    setShowAnswer(false);

    let updatedList = [...shuffledBlocks];
    if (pendingRemovalId) {
      updatedList = updatedList.filter(b => b.id !== pendingRemovalId);
      setPendingRemovalId(null);
    }

    const nextIndex = currentIndex >= updatedList.length - 1 ? 0 : currentIndex + 1;
    setShuffledBlocks(updatedList);
    setCurrentIndex(nextIndex);
  };

  const toggleAutoplay = () => setAutoplay(prev => !prev);

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>
          No eligible words. Go to Level 1 → tap star → then mark as Confident.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <WordRecordLayout
          block={current}
          imageAsset={imageMap[current.image]}
          showImage
          showTipIcon={showAnswer}
          showInfoIcon
          showEnglish={false}
          hideThaiText
          hidePhonetic
          hideAudioButton
          onToggleEnglish={() => {}}
          onShowTip={() => {}}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />

        <TouchableOpacity onPress={toggleAutoplay} style={styles.autoPlayIconWrapper}>
          <MaterialCommunityIcons
            name="autorenew"
            size={28}
            color={autoplay ? 'limegreen' : '#aaa'}
          />
        </TouchableOpacity>

        {!autoplay && showAnswer && currentStage >= 3 && (
          <Animated.View style={[styles.tickIconWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handleAdvanceToStage4} style={styles.tickIconCircle}>
              <MaterialCommunityIcons
                name={currentStage >= 4 ? 'check-circle' : 'check-circle-outline'}
                size={32}
                color={currentStage >= 4 ? 'limegreen' : 'gray'}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.centeredContent}>
        {showAnswer ? (
          <>
            <Text style={styles.phoneticText}>{current?.phonetic}</Text>
            <TouchableOpacity onPress={playAudio}>
              <Text style={styles.japaneseText}>{current?.foreign}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.japaneseText}>{current?.foreign}</Text>
        )}
      </View>

      {!autoplay && (
        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={styles.button}
            onPress={showAnswer ? handleNext : () => setShowAnswer(true)}
          >
            <Text style={styles.buttonText}>{showAnswer ? 'Next' : 'Show Answer'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  topHalf: { height: '58%', position: 'relative' },
  centeredContent: { alignItems: 'center', marginTop: 24, gap: 20 },
  japaneseText: {
    color: 'white',
    fontSize: 38,
    fontWeight: '600',
    textShadowColor: 'black',
    textShadowRadius: 4,
  },
  phoneticText: {
    color: '#ccc',
    fontSize: 26,
    fontWeight: '400',
    textShadowColor: 'black',
    textShadowRadius: 4,
  },
  tickIconWrapper: {
    position: 'absolute',
    bottom: 36,
    right: 20,
    zIndex: 5,
  },
  tickIconCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    padding: 6,
  },
  buttonArea: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  autoPlayIconWrapper: {
    position: 'absolute',
    top: 75,
    left: 20,
    zIndex: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    fontSize: 20,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
