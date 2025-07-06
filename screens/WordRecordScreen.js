import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import useForeignAudio from '../hooks/useForeignAudio';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function WordRecordScreenMVP() {
  const navigation = useNavigation();
  const route = useRoute();
  const { words, index = 0, mode = 'explore' } = route.params || {};

  if (!words || !Array.isArray(words) || index < 0 || index >= words.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>⚠️ Invalid word parameters</Text>
      </View>
    );
  }

  const word = words[index];
  const wordId = word?.id;

  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [progress, setProgress] = useState({});

  const stage = getStage(progress, wordId);
  const { playAudio, isLoaded } = useForeignAudio(word);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  useEffect(() => {
    if (word && isLoaded) {
      playAudio();
    }
  }, [word, isLoaded]);

  const handleSetStage = async (newStage) => {
    if (!wordId) return;
    await updateWordStage(wordId, newStage);
    const updated = await loadProgress();
    setProgress(updated);
  };

  const handleAdvanceFromStage0 = async () => {
    await updateWordStage(wordId, 2); // ✅ Skip to stage 2
    const updated = await loadProgress();
    setProgress(updated);
    // ⛔ Don't navigate away — just refresh stage and hide button
  };

  const goToPrev = () => {
    if (index > 0) {
      navigation.push('WordRecord', { words, index: index - 1, mode });
    }
  };

  const goToNext = () => {
    if (index < words.length - 1) {
      navigation.push('WordRecord', { words, index: index + 1, mode });
    }
  };

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
          onPlayAudio={playAudio}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onShowTip={() => setShowTip(true)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />

        {/* ✅ Only show Learn button if stage is 0 */}
        {wordId && mode === 'explore' && stage === 0 && (
          <TouchableOpacity onPress={handleAdvanceFromStage0}>
            <View style={styles.advanceButton}>
              <Text style={styles.advanceText}>Learn</Text>
            </View>
          </TouchableOpacity>
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
        <TouchableOpacity onPress={goToPrev} disabled={index === 0}>
          <Feather
            name="chevron-left"
            size={48}
            color={index === 0 ? 'gray' : '#888'}
            style={{ transform: [{ scaleX: 1 }, { scaleY: 1.4 }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNext} disabled={index >= words.length - 1}>
          <Feather
            name="chevron-right"
            size={48}
            color={index >= words.length - 1 ? 'gray' : '#888'}
            style={{ transform: [{ scaleX: 1 }, { scaleY: 1.4 }] }}
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
  advanceButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 12,
  },
  advanceText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  error: {
    marginTop: 40,
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
});
