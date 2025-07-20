import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';
import useDynamicAutoplay from '../hooks/useDynamicAutoplay';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function PracticeListenScreen() {
  const navigation = useNavigation();
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingRemovalId, setPendingRemovalId] = useState(null);
  const [autoplay, setAutoplay] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const current = shuffledBlocks[currentIndex];
  const currentStage = getStage(progress, current?.id);
  const soundRef = useRef(null);

  const handleNext = () => {
    let nextList = [...shuffledBlocks];
    if (pendingRemovalId) {
      nextList = nextList.filter(b => b.id !== pendingRemovalId);
      setPendingRemovalId(null);
    }
    const nextIndex = (currentIndex + 1) % nextList.length;
    setShuffledBlocks(nextList);
    setCurrentIndex(nextIndex >= nextList.length ? 0 : nextIndex);
  };

  useDynamicAutoplay({
    active: autoplay,
    block: {
      ...current,
      audioFrench: current?.audioSpanish, // 🔄 Use Spanish audio in autoplay
    },
    onReveal: () => setShowAnswer(true),
    onAdvance: handleNext,
  });

  useFocusEffect(
    useCallback(() => {
      async function loadEligibleWords() {
        const progressMap = await loadProgress();
        const eligible = blocks.filter(b => getStage(progressMap, b.id) === 2);
        setProgress(progressMap);
        setShuffledBlocks(shuffleArray(eligible));
        setCurrentIndex(0);
        setPendingRemovalId(null);
      }
      loadEligibleWords();
    }, [refreshKey])
  );

  useEffect(() => {
    setShowAnswer(false);
    setShowEnglish(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!current || autoplay || showAnswer) return;
    let isMounted = true;
    let firstDone = false;
    let localSound;

    const playJapaneseTwice = async () => {
      try {
        const uri = audioMap[current.audio];
        if (!uri) return;

        const { sound } = await Audio.Sound.createAsync(uri);
        localSound = sound;
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (!isMounted || !status.didJustFinish) return;
          if (!firstDone) {
            firstDone = true;
            setTimeout(() => {
              if (isMounted) sound.replayAsync().catch(() => {});
            }, 1000);
          } else {
            await sound.unloadAsync().catch(() => {});
          }
        });
      } catch (err) {
        console.warn('🔇 Failed Japanese repeat playback:', err.message);
      }
    };

    playJapaneseTwice();
    return () => {
      isMounted = false;
      if (localSound) localSound.unloadAsync().catch(() => {});
    };
  }, [current?.id, autoplay, showAnswer]);

  useEffect(() => {
    if (!current || autoplay || !showAnswer) return;

    let localSound;
    let timeout;

    const playSpanish = async () => {
      try {
        const uri = audioMap[current.audioSpanish];
        if (!uri) return;

        const { sound } = await Audio.Sound.createAsync(uri);
        localSound = sound;
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
          }
        });
      } catch (err) {
        console.warn('🔇 Failed Spanish reveal playback:', err.message);
      }
    };

    timeout = setTimeout(playSpanish, 500);
    return () => {
      if (timeout) clearTimeout(timeout);
      if (localSound) localSound.unloadAsync().catch(() => {});
    };
  }, [current?.id, autoplay, showAnswer]);

  const handleAdvanceToStage3 = async () => {
    if (!current?.id || currentStage >= 3) return;

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

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (err) {
      console.warn('Haptics error:', err.message);
    }

    await updateWordStage(current.id, 3);
    const updated = await loadProgress();
    setProgress(updated);
    setPendingRemovalId(current.id);
  };

  const toggleAutoplay = () => setAutoplay(prev => !prev);

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>
          No eligible words. Go to Learn → progress some → return here.
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
          showImage={showAnswer}
          showTipIcon={showAnswer}
          showInfoIcon={showAnswer}
          showEnglish={showEnglish}
          hideAudioButton={true}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
        />

        <TouchableOpacity onPress={toggleAutoplay} style={styles.autoPlayIconWrapper}>
          <MaterialCommunityIcons
            name="autorenew"
            size={28}
            color={autoplay ? 'limegreen' : '#aaa'}
          />
        </TouchableOpacity>

        {!autoplay && showAnswer && currentStage >= 2 && (
          <Animated.View style={[styles.tickIconWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handleAdvanceToStage3} style={styles.tickIconCircle}>
              <MaterialCommunityIcons
                name={currentStage >= 3 ? 'check-circle' : 'check-circle-outline'}
                size={32}
                color={currentStage >= 3 ? 'limegreen' : 'gray'}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.bottomHalf}>
        <WordInteractionBlock
          block={current}
          stage={currentStage}
          onStageChange={() => setRefreshKey(k => k + 1)}
          onPlayAudio={async () => {
            try {
              if (!current?.audio || !audioMap[current.audio]) return;
              if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
              }
              const { sound } = await Audio.Sound.createAsync(audioMap[current.audio]);
              soundRef.current = sound;
              await sound.playAsync();
            } catch (err) {
              console.warn('❌ Manual Japanese playback error:', err.message);
            }
          }}
          showStars={false}
          showInstruction={!showAnswer}
          showPhonetic={showAnswer}
        />

        {!autoplay && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={showAnswer ? handleNext : () => setShowAnswer(true)}
          >
            <Text style={styles.buttonText}>{showAnswer ? 'Next' : 'Show Answer'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  topHalf: { height: '58%', position: 'relative' },
  bottomHalf: {
    height: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  tickIconWrapper: {
    position: 'absolute',
    bottom: 36,
    right: 20,
    zIndex: 5,
  },
  tickIconCircle: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    padding: 6,
  },
  nextButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: 'white', fontSize: 18 },
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
