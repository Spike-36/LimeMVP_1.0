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
import { useTargetLang } from '../context/TargetLangContext';
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
  const { targetLang } = useTargetLang();

  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingRemovalId, setPendingRemovalId] = useState(null);
  const [autoplay, setAutoplay] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef(null);

  const current = shuffledBlocks[currentIndex];
  const capitalLang = targetLang.charAt(0).toUpperCase() + targetLang.slice(1);

  const audioKey = capitalLang === 'Japanese' ? 'audio' : `audio${capitalLang}`;
  const audioFemaleKey = `audio${capitalLang}Female`;
  const slowAudioKey = `audio${capitalLang}Slow`;

  const foreignText = current?.[targetLang] || current?.foreign || '';
  const phoneticText = current?.[`${targetLang}Phonetic`] ?? current?.phonetic ?? '';
  const currentStage = getStage(progress, current?.id);

  const currentBlock = {
    ...current,
    foreign: foreignText,
    phonetic: phoneticText,
  };

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
      ...currentBlock,
      audioFrench: current?.[audioKey],
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
    if (!autoplay && current && !showAnswer) {
      const playSequence = async () => {
        try {
          const femaleFile = current?.[audioFemaleKey] || current?.[audioKey];
          const normalFile = current?.[audioKey];
          const femaleSource = audioMap[femaleFile];
          const normalSource = audioMap[normalFile];

          if (!femaleFile || !femaleSource || !normalFile || !normalSource) return;

          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }

          const { sound: femaleSound } = await Audio.Sound.createAsync(femaleSource);
          soundRef.current = femaleSound;
          await femaleSound.playAsync();

          await new Promise((resolve) => {
            femaleSound.setOnPlaybackStatusUpdate((status) => {
              if (status.didJustFinish) {
                femaleSound.unloadAsync().catch(() => {});
                resolve();
              }
            });
          });

          await new Promise((r) => setTimeout(r, 1000));

          const { sound: normalSound } = await Audio.Sound.createAsync(normalSource);
          soundRef.current = normalSound;
          await normalSound.playAsync();

          normalSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              normalSound.unloadAsync().catch(() => {});
            }
          });

        } catch (err) {
          console.warn('❌ Pre-reveal sequence error:', err.message);
        }
      };

      playSequence();
    }
  }, [current, autoplay, showAnswer]);

  const handlePlaySlowAudio = async () => {
    const file = current?.[slowAudioKey];
    const source = audioMap[file];

    if (!file || !source) {
      console.warn(`⚠️ No slow ${targetLang} audio found:`, file);
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(source);
      soundRef.current = sound;
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.warn(`❌ Slow audio playback error:`, err.message);
    }
  };

  const handlePlayAudio = async () => {
    const file = current?.[audioKey];
    const source = audioMap[file];

    if (!file || !source) return;

    try {
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
      console.warn('❌ Manual playback error:', err.message);
    }
  };

  const toggleAutoplay = () => setAutoplay(prev => !prev);

  const handleAdvanceToStage3 = async () => {
    if (!current?.id || currentStage >= 3) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
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

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No eligible words. Go to Learn → progress some → return here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <WordRecordLayout
          block={currentBlock}
          imageAsset={imageMap[current.image]}
          showImage={showAnswer}
          showTipIcon={showAnswer}
          showInfoIcon={showAnswer}
          showEnglish={showEnglish}
          hideAudioButton={true}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onPhoneticPress={handlePlaySlowAudio}
          showSlowAudioIcon
          onSlowAudioPress={handlePlaySlowAudio}
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
          block={currentBlock}
          stage={currentStage}
          onStageChange={() => setRefreshKey(k => k + 1)}
          onPlayAudio={handlePlayAudio}
          onPhoneticPress={handlePlaySlowAudio}
          showStars={false}
          showInstruction={!showAnswer}
          showPhonetic={true}
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
    top: '40%',
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
