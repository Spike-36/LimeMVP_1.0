import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import StageAdvanceButton from '../components/StageAdvanceButton';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function WordRecordScreen() {
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

  const [sound, setSound] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [progress, setProgress] = useState({});

  const stage = getStage(progress, wordId);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  useEffect(() => {
    let loadedSound;
    const audioAsset = word?.audio && audioMap[word.audio];
    if (!audioAsset) return;

    const loadAudio = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(audioAsset);
        setSound(newSound);
        loadedSound = newSound;
      } catch (err) {
        console.warn('Audio preload error:', err);
      }
    };

    loadAudio();

    return () => {
      if (loadedSound) loadedSound.unloadAsync();
    };
  }, [word?.audio]);

  useEffect(() => {
    if (sound) {
      sound.replayAsync().catch(err => console.warn('Auto-play error:', err));
    }
  }, [sound]);

  const playAudio = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        console.warn('Playback error:', e);
      }
    }
  };

  const handleSetStage = async (newStage) => {
    if (!wordId) return;

    await updateWordStage(wordId, newStage);
    const updated = await loadProgress();
    setProgress(updated);
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
          onPressFind={() => navigation.navigate('VoiceSearch')}
        />

        {wordId && mode === 'explore' && stage === 0 && (
          <StageAdvanceButton
            wordId={wordId}
            currentStage={stage}
            requiredStage={0}
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
        <TouchableOpacity onPress={goToPrev} disabled={index === 0}>
          <Feather
            name="chevron-left"
            size={48}
            color={index === 0 ? 'gray' : '#888'}
            style={{ transform: [{ scaleY: 1.4 }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNext} disabled={index >= words.length - 1}>
          <Feather
            name="chevron-right"
            size={48}
            color={index >= words.length - 1 ? 'gray' : '#888'}
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
  error: {
    marginTop: 40,
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
});
