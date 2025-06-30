import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import StageAdvanceButton from '../components/StageAdvanceButton';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

console.log('🎧 Listen screen loaded');

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
  const [sound, setSound] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);

  const current = shuffledBlocks[currentIndex];
  const currentStage = getStage(progress, current?.id);

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
    }, [])
  );

  useEffect(() => {
    setShowAnswer(false);
    setShowEnglish(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!current) return;

    const play = async () => {
      const asset = current.audio && audioMap[current.audio];
      if (!asset) return;

      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: newSound } = await Audio.Sound.createAsync(asset);
        setSound(newSound);
        await newSound.replayAsync();
      } catch (err) {
        console.warn('Audio playback error:', err);
      }
    };

    play();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [current]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % shuffledBlocks.length);
  };

  const handleStageSelect = async (stage) => {
    const wordId = current.id;
    await updateWordStage(wordId, stage);
    const updated = await loadProgress();
    const eligible = blocks.filter(b => getStage(updated, b.id) === 2);

    setProgress(updated);
    setShuffledBlocks(shuffleArray(eligible));
    setCurrentIndex((prev) => {
      const nextIndex = prev >= eligible.length ? eligible.length - 1 : prev;
      return Math.max(0, nextIndex);
    });
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
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />

        {showAnswer && current?.id && currentStage === 2 && (
          <StageAdvanceButton
            key={current.id}
            wordId={current.id}
            currentStage={currentStage}
            requiredStage={2}
            onStageChange={handleStageSelect}
          />
        )}
      </View>

      <View style={styles.bottomHalf}>
        <WordInteractionBlock
          block={current}
          stage={currentStage}
          onStageChange={handleStageSelect}
          onPlayAudio={() => {}}
          showStars={false}
          showInstruction={!showAnswer}
        />

        <TouchableOpacity style={styles.nextButton} onPress={showAnswer ? handleNext : () => setShowAnswer(true)}>
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
