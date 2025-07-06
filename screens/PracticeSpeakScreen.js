import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { imageMap } from '../components/imageMap';
import StageAdvanceButton from '../components/StageAdvanceButton';
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

export default function PracticeSpeakScreen() {
  const navigation = useNavigation();
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [progress, setProgress] = useState({});

  const current = shuffledBlocks[currentIndex];
  const currentStage = current?.id ? getStage(progress, current.id) : 0;
  const { playAudio, isLoaded } = useForeignAudio(current);

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
    if (current && isLoaded && showAnswer) {
      playAudio();
    }
  }, [current, isLoaded, showAnswer]);

  const handleNext = () => {
    setShowAnswer(false);
    setShowEnglish(false);
    if (shuffledBlocks.length === 0) return;
    setCurrentIndex((prev) => Math.min(prev + 1, shuffledBlocks.length - 1));
  };

  const handleStageSelect = async (stage) => {
    if (!current?.id) return;
    const wordId = current.id;
    await updateWordStage(wordId, stage);
    const updated = await loadProgress();
    setProgress(updated);
    if (stage > currentStage) {
      setShuffledBlocks((prev) => prev.filter((b) => b.id !== wordId));
      handleNext();
    }
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

        {showAnswer && current?.id && currentStage === 3 && (
          <StageAdvanceButton
            key={current.id}
            wordId={current.id}
            currentStage={currentStage}
            requiredStage={3}
            onStageChange={handleStageSelect}
          />
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
