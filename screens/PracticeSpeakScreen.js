import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import { useTargetLang } from '../context/TargetLangContext';
import blocks from '../data/blocks.json';
import { getDynamicWordFields } from '../utils/getDynamicWordFields';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function PracticeSpeakScreen() {
  const { targetLang } = useTargetLang();
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingRemovalId, setPendingRemovalId] = useState(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef(null);

  const raw = shuffledBlocks[currentIndex];
  const {
    foreignText,
    phoneticText,
    audioKey,
  } = getDynamicWordFields(raw, targetLang);

  const current = raw
    ? {
        ...raw,
        foreign: foreignText,
        phonetic: phoneticText,
      }
    : null;

  const currentStage = getStage(progress, current?.id);

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

  const handleAdvanceToStage4 = async () => {
    if (!current?.id) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
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

  const handleMarkWrongAndAdvance = async () => {
    setShowAnswer(false);
    await new Promise(r => setTimeout(r, 500));
    handleNext();
  };

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
    }, [refreshKey])
  );

  useEffect(() => {
    setShowAnswer(false);
    setShowEnglish(false);
  }, [currentIndex]);

  const handlePlayNativeAudio = async () => {
    try {
      const file = current?.[audioKey];
      const source = audioMap[file];
      if (!file || !source) return;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(source);
      soundRef.current = sound;
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      console.warn('❌ Native audio playback error:', err.message);
    }
  };

  // ✅ Play audio only on reveal
  useEffect(() => {
    if (!showAnswer) return;
    handlePlayNativeAudio();
  }, [showAnswer]);

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No eligible words. Go to Listen → progress some → return here.</Text>
      </View>
    );
  }

  const shouldShowEnglishText =
    (showAnswer && showEnglish) || current?.showIndex === '1';

  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <WordRecordLayout
          block={current}
          imageAsset={imageMap[current.image]}
          showImage={true}
          showTipIcon={showAnswer}
          showInfoIcon={showAnswer}
          showEnglish={shouldShowEnglishText}
          hideAudioButton={true}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
        />

        {showAnswer && (
          <Animated.View style={[styles.tickIconWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handleMarkWrongAndAdvance} style={styles.tickIconCircle}>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={32}
                color="red"
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
          onPlayAudio={handlePlayNativeAudio}
          showStars={false}
          showInstruction={!showAnswer}
          showPhonetic={showAnswer}
        />

        <TouchableOpacity
          style={styles.nextButton}
          onPress={async () => {
            if (!showAnswer) {
              setShowAnswer(true);
            } else {
              await handleAdvanceToStage4();
              handleNext();
            }
          }}
        >
          <Text style={styles.buttonText}>{showAnswer ? 'Next' : 'Show Answer'}</Text>
        </TouchableOpacity>
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
