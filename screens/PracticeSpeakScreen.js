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

console.log('📢 Speak screen loaded');

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
  const [showTip, setShowTip] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [progress, setProgress] = useState({});
  const [sound, setSound] = useState(null);

  const current = shuffledBlocks[currentIndex];
  const currentStage = current?.id ? getStage(progress, current.id) : 0;
  console.log('🧪 Speak Screen - Word ID:', current?.id, 'Stage:', currentStage);

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

  const playAudio = async () => {
    const asset = current?.audio && audioMap[current.audio];
    if (!asset) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(asset);
      setSound(newSound);
      await newSound.replayAsync();
    } catch (err) {
      console.warn('Audio error:', err);
    }
  };

  useEffect(() => {
    if (!current) return;

    const loadAndPlay = async () => {
      const asset = current.audio && audioMap[current.audio];
      if (!asset) return;

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(asset);
        setSound(newSound);
        await newSound.replayAsync();
      } catch (err) {
        console.warn('Auto-play error:', err);
      }
    };

    loadAndPlay();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [current]);

  const handleNext = () => {
    setShowAnswer(false);
    setShowTip(false);
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
    }
  };

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>
          No eligible words. Go to Explore → tap star → then mark as Confident.
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
          onToggleEnglish={() => setShowEnglish(true)}
          onShowTip={() => setShowTip(true)}
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

      <View style={[styles.stackBlock, !showAnswer && { paddingTop: 48 }]}>
        <View
          style={[
            styles.interactionWrapper,
            !showAnswer && styles.preRevealPushDown,
            showAnswer && styles.revealUp,
          ]}
        >
          <WordInteractionBlock
            block={current}
            stage={currentStage}
            onStageChange={handleStageSelect}
            onPlayAudio={playAudio}
            showStars={false}
            showInstruction={!showAnswer}
          />
        </View>

        <View style={[styles.buttonWrapper, showAnswer && styles.revealButtonUp]}>
          <TouchableOpacity
            style={styles.button}
            onPress={showAnswer ? handleNext : () => setShowAnswer(true)}
          >
            <Text style={styles.buttonText}>{showAnswer ? 'Next' : 'Show Answer'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showTip && (
        <View style={styles.tipOverlay}>
          <Text style={styles.tipText}>{current.tip}</Text>
          <Text style={styles.closeTip} onPress={() => setShowTip(false)}>✕</Text>
        </View>
      )}
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
  stackBlock: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  interactionWrapper: {
    alignItems: 'center',
  },
  preRevealPushDown: {
    marginTop: 15,
  },
  revealUp: {
    marginTop: -20,
  },
  buttonWrapper: {
    minHeight: 60,
    marginTop: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealButtonUp: {
    marginTop: -16,
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
  tipOverlay: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 12,
    zIndex: 999,
  },
  tipText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  closeTip: {
    color: '#FFD700',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 16,
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
