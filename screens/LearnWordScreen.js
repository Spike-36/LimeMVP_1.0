import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { imageMap } from '../components/imageMap';
import StageAdvanceButton from '../components/StageAdvanceButton';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import blocks from '../data/blocks.json';
import useForeignAudio from '../hooks/useForeignAudio';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function LearnWordScreen() {
  const navigation = useNavigation();
  const [eligibleWords, setEligibleWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [progress, setProgress] = useState({});

  const word = eligibleWords[currentIndex];
  const wordId = word?.id;
  const stage = getStage(progress, wordId);

  const { playAudio, isLoaded } = useForeignAudio(word);

  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        const stored = await loadProgress();
        const filtered = blocks.filter(b => getStage(stored, b.id) === 1);
        setProgress(stored);
        setEligibleWords(filtered);
        setCurrentIndex(0);
      };
      fetchProgress();
    }, [])
  );

  useEffect(() => {
    setShowEnglish(false);
    setShowTip(false);
  }, [currentIndex]);

  useEffect(() => {
    if (word && isLoaded) {
      playAudio();
    }
  }, [word, isLoaded]);

  const handleSetStage = async (newStage) => {
    if (!wordId) return;

    await updateWordStage(wordId, newStage);
    const updated = await loadProgress();
    const updatedEligible = blocks.filter(b => getStage(updated, b.id) === 1);
    setProgress(updated);
    setEligibleWords(updatedEligible);
    setCurrentIndex(updatedEligible.findIndex(w => w.id === wordId) || 0);
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < eligibleWords.length - 1) setCurrentIndex(currentIndex + 1);
  };

  if (!word) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>⚠️ No one-star words found</Text>
      </View>
    );
  }

  return (
    <View style={styles.fixedContainer}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.topHalf}>
        <WordRecordLayout
          block={word}
          imageAsset={imageMap[word.image]}
          showImage
          showTipIcon
          showInfoIcon
          showEnglish={showEnglish}
          hideAudioButton
          onPlayAudio={playAudio}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onShowTip={() => setShowTip(true)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />

        {wordId && stage === 1 && (
          <StageAdvanceButton
            wordId={wordId}
            currentStage={stage}
            requiredStage={1}
            onStageChange={handleSetStage}
          />
        )}
      </View>

      <View style={styles.interactionBlock}>
        <WordInteractionBlock
          block={word}
          stage={stage}
          onStageChange={handleSetStage}
          onPlayAudio={playAudio}
          showStars={false}
          showInstruction={false}
        />
      </View>

      {showTip && (
        <View style={styles.tipOverlay}>
          <Text style={styles.tipText}>{word.tip}</Text>
          <Text style={styles.closeTip} onPress={() => setShowTip(false)}>✕</Text>
        </View>
      )}

      <View style={styles.navButtons}>
        <TouchableOpacity onPress={goToPrev} disabled={currentIndex === 0}>
          <Feather
            name="chevron-left"
            size={48}
            color={currentIndex === 0 ? 'gray' : '#888'}
            style={{ transform: [{ scaleY: 1.4 }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNext} disabled={currentIndex >= eligibleWords.length - 1}>
          <Feather
            name="chevron-right"
            size={48}
            color={currentIndex >= eligibleWords.length - 1 ? 'gray' : '#888'}
            style={{ transform: [{ scaleY: 1.4 }] }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'flex-start',
  },
  topHalf: {
    height: '58%',
  },
  interactionBlock: {
    height: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  error: {
    marginTop: 40,
    fontSize: 18,
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
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
