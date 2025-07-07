import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { imageMap } from '../components/imageMap';
import StageAdvanceButton from '../components/StageAdvanceButton';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';
import useForeignAudio from '../hooks/useForeignAudio';
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
  const { playAudio, isLoaded } = useForeignAudio(current);

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
    if (!current?.audio) return;

    let retryCount = 0;
    let isActive = true;

    const tryPlay = async () => {
      while (isActive && retryCount < 5) {
        if (isLoaded) {
          await playAudio();
          return;
        }
        retryCount++;
        await new Promise(res => setTimeout(res, 200));
      }
      if (isActive && !isLoaded) {
        console.warn('⚠️ Audio still not loaded after retries');
      }
    };

    tryPlay();

    return () => {
      isActive = false;
    };
  }, [current?.id, isLoaded]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % shuffledBlocks.length);
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
