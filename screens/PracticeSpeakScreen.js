
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
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
          showImage={true}
          showTipIcon={false}
          showInfoIcon={true}
          showEnglish={showEnglish}
          hideThaiText={true}
          hidePhonetic={true}
          hideAudioButton={true}
          onPlayAudio={playAudio}
          onToggleEnglish={() => setShowEnglish(true)}
          onShowTip={() => setShowTip(true)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />
        {!showAnswer && (
          <View style={styles.japaneseWrapper}>
            <Text style={styles.japaneseText}>{current?.foreign}</Text>
          </View>
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
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topHalf: {
    height: '58%',
    position: 'relative',
  },
  japaneseWrapper: {
    position: 'absolute',
    bottom: -36,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  japaneseText: {
    color: 'white',
    fontSize: 38,
    fontWeight: '600',
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