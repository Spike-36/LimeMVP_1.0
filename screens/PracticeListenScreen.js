import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import ProgressSelector from '../components/ProgressSelector';
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
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [progress, setProgress] = useState({});
  const [sound, setSound] = useState(null);

  const current = shuffledBlocks[currentIndex];

  useFocusEffect(
    useCallback(() => {
      async function loadEligibleWords() {
        const progressMap = await loadProgress();
        console.log('✅ Loaded progress:', progressMap);

        const eligible = blocks.filter(b => {
          const stage = getStage(progressMap, b.id);
          return stage === 1 || stage === 2; // Only Learning or Familiar
        });

        console.log('🎯 Eligible for Listen:', eligible.map(e => e.english));

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
      console.warn('❌ Audio error:', err);
    }
  };

  // 🔈 Auto-play audio on word change
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
        console.warn('⚠️ Auto-play error:', err);
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
    setCurrentIndex((prev) => (prev + 1) % shuffledBlocks.length);
  };

  const handleStageSelect = async (stage) => {
    const wordId = current.id;
    await updateWordStage(wordId, stage);
    const updated = await loadProgress();
    setProgress(updated);
  };

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>
          No eligible words. Go to Explore → tap star → then mark as Familiar.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        bottomContent={
          showAnswer ? (
            <>
              <ProgressSelector
                currentStage={getStage(progress, current.id)}
                onSelect={handleStageSelect}
              />
              <View style={styles.buttonRow}>
                <Button title="Next" onPress={handleNext} />
              </View>
            </>
          ) : (
            <View style={styles.buttonContainer}>
              <Button title="Show Answer" onPress={() => setShowAnswer(true)} />
            </View>
          )
        }
      />

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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  buttonContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  emptyText: {
    fontSize: 20,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 24,
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
});
