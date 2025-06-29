import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import StageAdvanceButton from '../components/StageAdvanceButton';
import WordInteractionBlock, { renderStars } from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function WordRecordScreen({ route }) {
  const navigation = useNavigation();
  const words = route.params?.words || [];
  const index = route.params?.index ?? 0;
  const word = words[index];

  const [sound, setSound] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [progress, setProgress] = useState({});

  const wordId = word?.id;
  const stage = getStage(progress, wordId);

  useEffect(() => {
    const fetchProgress = async () => {
      const data = await loadProgress();
      setProgress(data);
    };
    fetchProgress();
  }, []);

  const handleSetStage = async (newStage, updatedProgress = null) => {
    if (!wordId) return;
    await updateWordStage(wordId, newStage);
    const updated = updatedProgress || await loadProgress();
    setProgress(updated);
  };

  useEffect(() => {
    let loadedSound;
    const audioAsset = word?.audio && audioMap[word.audio];

    const loadAudio = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(audioAsset);
        setSound(newSound);
        loadedSound = newSound;
      } catch (err) {
        console.warn('Failed to preload audio:', err);
      }
    };

    if (audioAsset) loadAudio();

    return () => {
      if (loadedSound) loadedSound.unloadAsync();
    };
  }, [word?.audio]);

  useEffect(() => {
    if (sound) {
      sound.replayAsync().catch((e) => console.warn('Auto-play error:', e));
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

  const navigateToIndex = (newIndex) => {
    navigation.replace('WordRecord', {
      words,
      index: newIndex,
    });
  };

  if (!word) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Word not found</Text>
      </View>
    );
  }

  const imageAsset = imageMap[word.image];

  return (
    <View style={styles.fixedContainer}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.topHalf}>
        <WordRecordLayout
          block={word}
          imageAsset={imageAsset}
          showImage
          showTipIcon
          showInfoIcon
          showEnglish={showEnglish}
          hideAudioButton
          onPlayAudio={playAudio}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onShowTip={() => setShowTip(true)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
          stars={renderStars(stage, handleSetStage)}
        />

        <StageAdvanceButton
          wordId={wordId}
          currentStage={stage}
          requiredStage={0} // only shows for Explore-stage words
          onStageChange={handleSetStage}
        />
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
        <TouchableOpacity onPress={() => navigateToIndex(index - 1)} disabled={index === 0}>
          <Feather
            name="chevron-left"
            size={48}
            color={index === 0 ? 'gray' : '#888'}
            style={{ transform: [{ scaleY: 1.4 }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToIndex(index + 1)} disabled={index >= words.length - 1}>
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
  error: {
    marginTop: 40,
    fontSize: 18,
    color: 'red',
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
