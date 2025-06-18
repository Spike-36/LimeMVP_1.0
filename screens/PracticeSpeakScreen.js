// screens/PracticeSpeakScreen.js
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import RecorderBlock from '../components/RecorderBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export default function PracticeSpeakScreen() {
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userRecordingUri, setUserRecordingUri] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);

  const current = shuffledBlocks[currentIndex];
  const asset = current?.audio && audioMap[current.audio];

  useEffect(() => {
    const shuffled = shuffleArray(blocks);
    setShuffledBlocks(shuffled);
  }, []);

  const handleNext = () => {
    setShowAnswer(false);
    setUserRecordingUri(null);
    setShowEnglish(false);
    setShowTip(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledBlocks.length);
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
      console.warn('❌ Failed to play native audio:', err);
    }
  };

  const playUserRecording = async () => {
    if (!userRecordingUri) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: userRecordingUri },
        { volume: 1.0 }
      );
      await sound.playAsync();
      const status = await sound.getStatusAsync();
      const duration = status?.durationMillis || 2000;
      await delay(duration + 200);
      await sound.unloadAsync();
    } catch (err) {
      console.warn('❌ Failed to play user recording:', err);
    }
  };

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No blocks found.</Text>
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
        bottomContent={
          showAnswer ? (
            <View style={styles.iconButtonRow}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name="play-circle"
                  size={64}
                  color="#1E90FF"
                  onPress={playNativeAudio}
                />
              </View>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name="play-circle"
                  size={64}
                  color="#32CD32"
                  onPress={playUserRecording}
                />
              </View>
            </View>
          ) : userRecordingUri ? (
            <View style={styles.iconButtonRow}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name="play-circle"
                  size={64}
                  color="#1E90FF"
                  onPress={playUserRecording}
                />
              </View>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name="mic-circle"
                  size={64}
                  color="#FFA500"
                  onPress={() => setUserRecordingUri(null)}
                />
              </View>
            </View>
          ) : (
            <RecorderBlock onRecordingFinished={handleRecordingFinished} />
          )
        }
      />

      {showTip && (
        <View style={styles.tipOverlay}>
          <Text style={styles.tipText}>{current.tip}</Text>
          <Text style={styles.closeTip} onPress={() => setShowTip(false)}>✕</Text>
        </View>
      )}

      {showAnswer && (
        <View style={styles.buttonRow}>
          <Button title="Forgot" onPress={handleNext} />
          <Button title="Hard" onPress={handleNext} />
          <Button title="Easy" onPress={handleNext} />
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
  emptyText: {
    fontSize: 20,
    color: 'gray',
    textAlign: 'center',
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
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  audioButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  iconButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
    paddingHorizontal: 60,
    marginTop: 0,
  },
  iconWrapper: {
    flex: 1,
    alignItems: 'center',
  },
});
