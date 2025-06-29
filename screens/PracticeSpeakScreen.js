import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import RecorderBlock from '../components/RecorderBlock';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';
import { getStage, loadProgress } from '../utils/progressStorage';

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export default function PracticeSpeakScreen() {
  const navigation = useNavigation();
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userRecordingUri, setUserRecordingUri] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [progress, setProgress] = useState({});
  const [nativeSound, setNativeSound] = useState(null);

  const current = shuffledBlocks[currentIndex];
  const asset = current?.audio && audioMap[current.audio];

  useFocusEffect(
    useCallback(() => {
      async function loadEligibleWords() {
        const stored = await loadProgress();
        const eligible = blocks.filter(b => getStage(stored, b.id) >= 2);
        setProgress(stored);
        setShuffledBlocks(shuffleArray(eligible));
        setCurrentIndex(0);
      }
      loadEligibleWords();
    }, [])
  );

  useEffect(() => {
    if (!asset) return;

    const loadAndPlay = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
        });

        const { sound } = await Audio.Sound.createAsync(asset, { volume: 1.0 });
        setNativeSound(sound);
        await sound.playAsync();
        const status = await sound.getStatusAsync();
        const duration = status?.durationMillis || 2000;
        await delay(duration + 200);
      } catch (err) {
        console.warn('Auto-play failed:', err);
      }
    };

    loadAndPlay();

    return () => {
      if (nativeSound) {
        nativeSound.unloadAsync().catch(() => {});
      }
    };
  }, [current]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % shuffledBlocks.length;
    setCurrentIndex(nextIndex);
    setShowAnswer(false);
    setUserRecordingUri(null);
    setShowEnglish(false);
    setShowTip(false);
  };

  const handleRecordingFinished = (uri) => {
    setUserRecordingUri(uri);
  };

  const playNativeAudio = async () => {
    if (!asset) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
      const { sound } = await Audio.Sound.createAsync(asset, { volume: 1.0 });
      await sound.playAsync();
      const status = await sound.getStatusAsync();
      const duration = status?.durationMillis || 2000;
      await delay(duration + 200);
      await sound.unloadAsync();
    } catch (err) {
      console.warn('Native audio failed:', err);
    }
  };

  const playUserRecording = async () => {
    if (!userRecordingUri) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: userRecordingUri }, { volume: 1.0 });
      await sound.playAsync();
      const status = await sound.getStatusAsync();
      const duration = status?.durationMillis || 2000;
      await delay(duration + 200);
      await sound.unloadAsync();
    } catch (err) {
      console.warn('User recording playback failed:', err);
    }
  };

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>
          No eligible words. Go to Explore → tap stars → then mark as 'Familiar'.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WordRecordLayout
        block={current}
        imageAsset={imageMap[current.image]}
        showImage={true}
        showTipIcon={showAnswer}
        showInfoIcon={true}
        showEnglish={showEnglish}
        hideThaiText={!showAnswer}
        hidePhonetic={!showAnswer}
        hideAudioButton={true}
        onToggleEnglish={() => setShowEnglish(!showEnglish)}
        onShowTip={() => setShowTip(true)}
        onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        bottomContent={
          showAnswer ? (
            <View>
              <View style={styles.raisedInteraction}>
                <WordInteractionBlock
                  block={current}
                  onPlayAudio={playNativeAudio}
                  showStars={false}
                  showInstruction={false}
                />
              </View>

              <View style={styles.iconButtonRow}>
                <Ionicons name="play-circle" size={56} color="#1E90FF" onPress={playNativeAudio} />
                <Ionicons name="play-circle" size={56} color="#32CD32" onPress={playUserRecording} />
              </View>

              <View style={styles.buttonRow}>
                <Button title="Next" onPress={handleNext} />
              </View>
            </View>
          ) : userRecordingUri ? (
            <View style={styles.iconButtonRow}>
              <Ionicons name="play-circle" size={56} color="#1E90FF" onPress={playUserRecording} />
              <Ionicons name="mic-circle" size={56} color="#FFA500" onPress={() => setUserRecordingUri(null)} />
            </View>
          ) : (
            <RecorderBlock onRecordingFinished={handleRecordingFinished} />
          )
        }
      />

      {showTip && (
        <View style={styles.tipOverlay}>
          <Text style={styles.tipText}>{current.tip}</Text>
          <Text style={styles.closeTip} onPress={() => setShowTip(false)}>\u2715</Text>
        </View>
      )}

      {!showAnswer && (
        <View style={styles.buttonContainer}>
          <Button title="Show Answer" onPress={() => setShowAnswer(true)} />
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
  buttonContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  iconButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingHorizontal: 40,
  },
  raisedInteraction: {
    marginTop: -8,
  },
});
