import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';

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

  const current = shuffledBlocks[currentIndex];

  useEffect(() => {
    const shuffled = shuffleArray(blocks);
    setShuffledBlocks(shuffled);
  }, []);

  const playAudio = async () => {
    const asset = current?.audio && audioMap[current.audio];
    if (!asset) return;
    try {
      const { sound } = await Audio.Sound.createAsync(asset);
      await sound.playAsync();
    } catch (err) {
      console.warn('❌ Audio error:', err);
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    setShowTip(false);
    setShowEnglish(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledBlocks.length);
  };

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No word records available.</Text>
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
        onPlayAudio={playAudio}
        onToggleEnglish={() => setShowEnglish(true)}
        onShowTip={() => setShowTip(true)}
        bottomContent={
          showAnswer ? (
            <View style={styles.buttonRow}>
              <Button title="Next" onPress={handleNext} />
            </View>
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
