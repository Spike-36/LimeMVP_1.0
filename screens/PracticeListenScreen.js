import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';
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

  const current = shuffledBlocks[currentIndex];
  const currentStage = getStage(progress, current?.id);
  const soundRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      async function loadEligibleWords() {
        const progressMap = await loadProgress();
        const eligible = blocks.filter(b => getStage(progressMap, b.id) === 2);
        setProgress(progressMap);
        setShuffledBlocks(shuffleArray(eligible));
        setCurrentIndex(0);
      }

      loadEligibleWords();
    }, [refreshKey])
  );

  useEffect(() => {
    setShowAnswer(false);
    setShowEnglish(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!current?.audio || !audioMap[current.audio]) return;

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
        console.warn('❌ Audio error in PracticeListen:', err.message);
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
  }, [current?.audio]);

  const playAudio = async () => {
    if (!soundRef.current) {
      console.warn('⚠️ Tried to play before audio loaded');
      return;
    }
    try {
      await soundRef.current.replayAsync();
    } catch (err) {
      console.warn('❌ Manual replay error:', err.message);
    }
  };

  const handleAdvanceToStage3 = async () => {
    if (!current?.id || currentStage >= 3) return;
    await updateWordStage(current.id, 3);
    const updatedProgress = await loadProgress();
    setProgress(updatedProgress); // ✅ just update tick to green
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % shuffledBlocks.length;
    setCurrentIndex(nextIndex);
    setRefreshKey(prev => prev + 1); // 🔄 triggers fresh list and reshuffle
  };

  const handleStageSelect = async (stage) => {
    const wordId = current.id;
    await updateWordStage(wordId, stage);
    const updated = await loadProgress();
    const eligible = blocks.filter(b => getStage(updated, b.id) === 2);
    setShowAnswer(false);
    setShowEnglish(false);
    setProgress(updated);
    setShuffledBlocks(shuffleArray(eligible));
    setCurrentIndex(0);
    setRefreshKey(prev => prev + 1);
  };

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
          onPlayAudio={playAudio}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />

        {showAnswer && currentStage >= 2 && (
          <TouchableOpacity
            onPress={handleAdvanceToStage3}
            style={styles.tickIconWrapper}
          >
            <View style={styles.tickIconCircle}>
              <MaterialCommunityIcons
                name={currentStage >= 3 ? 'check-circle' : 'check-circle-outline'}
                size={32}
                color={currentStage >= 3 ? 'limegreen' : 'gray'}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomHalf}>
        <WordInteractionBlock
          block={current}
          stage={currentStage}
          onStageChange={handleStageSelect}
          onPlayAudio={playAudio}
          showStars={false}
          showInstruction={!showAnswer}
          showPhonetic={showAnswer}
        />

        <TouchableOpacity
          style={styles.nextButton}
          onPress={showAnswer ? handleNext : () => setShowAnswer(true)}
        >
          <Text style={styles.buttonText}>{showAnswer ? 'Next' : 'Show Answer'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topHalf: {
    height: '58%',
    position: 'relative',
  },
  bottomHalf: {
    height: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
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
