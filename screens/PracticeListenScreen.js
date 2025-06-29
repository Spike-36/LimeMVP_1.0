// screens/PracticeListenScreen.js
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        const eligible = blocks.filter(b => {
          const stage = getStage(progressMap, b.id);
          return stage === 1 || stage === 2;
        });

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

  const stars = [0, 1, 2, 3].map((level) => (
    <TouchableOpacity key={level} onPress={() => handleStageSelect(level + 1)}>
      <FontAwesome
        name={getStage(progress, current.id) > level ? 'star' : 'star-o'}
        size={20}
        color={getStage(progress, current.id) > level ? '#FFD700' : '#555'}
        style={{ marginLeft: 2 }}
      />
    </TouchableOpacity>
  ));

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
        onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })} // ✅ FIX APPLIED HERE
        stars={showAnswer ? stars : null}
        topContent={
          <View style={[styles.stackBlock, !showAnswer && { paddingTop: 48 }]}>
            <View
              style={[
                styles.interactionWrapper,
                !showAnswer && styles.preRevealPushDown,
                showAnswer && styles.revealUp
              ]}
            >
              <WordInteractionBlock
                block={current}
                stage={getStage(progress, current.id)}
                onStageChange={handleStageSelect}
                onPlayAudio={playAudio}
                showStars={false}
                showInstruction={!showAnswer}
              />
            </View>

            <View style={[styles.buttonWrapper, showAnswer && styles.revealButtonUp]}>
              <TouchableOpacity style={styles.button} onPress={showAnswer ? handleNext : () => setShowAnswer(true)}>
                <Text style={styles.buttonText}>{showAnswer ? 'Next' : 'Show Answer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {showTip && (
        <View style={styles.tipOverlay}>
          <Text style={styles.tipText}>{current.tip}</Text>
          <Text style={styles.closeTip} onPress={() => setShowTip(false)}>\u2715</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
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
});
