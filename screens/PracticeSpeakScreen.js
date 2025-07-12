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
  const [showEnglish, setShowEnglish] = useState(false);
  const [progress, setProgress] = useState({});
  const soundRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const current = shuffledBlocks[currentIndex];
  const currentStage = current?.id ? getStage(progress, current.id) : 0;

  useFocusEffect(
    useCallback(() => {
      async function loadEligibleWords() {
        const progressMap = await loadProgress();
        const eligible = blocks.filter(b => getStage(progressMap, b.id) === 3);
        setProgress(progressMap);
        setShuffledBlocks(shuffleArray(eligible));
        setCurrentIndex(0);
      }
      loadEligibleWords();
    }, [])
  );

  useEffect(() => {
    if (!current?.audio || !showAnswer) return;

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

    if (currentStage === 3) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (err) {
        console.warn('Haptics error:', err.message);
      }
    }

    await updateWordStage(current.id, 4);
    const updated = await loadProgress();
    setProgress(updated);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setShowEnglish(false);

    const nextBlocks = shuffledBlocks.filter(b => getStage(progress, b.id) === 3);
    const nextIndex = nextBlocks.length > 0 ? 0 : 0;
    setShuffledBlocks(shuffleArray(nextBlocks));
    setCurrentIndex(nextIndex);
  };

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
          showEnglish={showEnglish}
          hideThaiText
          hidePhonetic
          hideAudioButton
          onToggleEnglish={() => setShowEnglish(prev => !prev)}
          onShowTip={() => {}}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />

        {showAnswer && currentStage >= 3 && (
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

      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.button}
          onPress={showAnswer ? handleNext : () => setShowAnswer(true)}
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
