import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import { useTargetLang } from '../context/TargetLangContext';
import { getDynamicWordFields } from '../utils/getDynamicWordFields';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function WordRecordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { words, index = 0, mode = 'explore' } = route.params || {};
  const { targetLang } = useTargetLang();

  if (!words || !Array.isArray(words) || index < 0 || index >= words.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>⚠️ Invalid word parameters</Text>
      </View>
    );
  }

  const word = words[index];
  const wordId = word?.id;
  const [progress, setProgress] = useState({});
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const stage = getStage(progress, wordId);

  // 🎯 Use hardwired gateField
  const capitalized = targetLang.charAt(0).toUpperCase() + targetLang.slice(1);
  const gateField = `lime${capitalized[0]}100`;
  const isBlocked = !word?.[gateField] || parseInt(word[gateField]) < 1;

  // ✅ Core logic using helper
  const {
    foreignText,
    phoneticText,
    audioKey,
    slowAudioKey,
  } = getDynamicWordFields(word, targetLang);

  const soundRef = useRef(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const playInitialAudio = async () => {
      const file = word?.[audioKey];
      const source = audioMap[file];
      if (!file || !source) return;

      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current.setOnPlaybackStatusUpdate(null);
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(source);
        soundRef.current = sound;

        if (isMounted) await sound.playAsync();
      } catch (err) {
        console.warn('❌ Error loading audio:', err.message);
      }
    };

    playInitialAudio();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [word, targetLang]);

  const playAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      } else {
        console.warn('⚠️ No audio loaded');
      }
    } catch (err) {
      console.warn('❌ Manual playback error:', err.message);
    }
  };

  const playSlowAudio = async () => {
    const file = word?.[slowAudioKey];
    const source = audioMap[file];
    if (!file || !source) {
      console.warn('⚠️ No slow audio:', slowAudioKey);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(source);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (err) {
      console.warn('❌ Slow audio error:', err.message);
    }
  };

  const handleSetStage = async (newStage) => {
    if (!wordId) return;
    await updateWordStage(wordId, newStage);
    const updated = await loadProgress();
    setProgress(updated);
  };

  const handleAdvanceToStage1 = async () => {
    if (stage >= 1 || !wordId) return;
    await updateWordStage(wordId, 2);
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

  if (isBlocked) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>⛔ This word is not available in {targetLang} yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.fixedContainer}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.topHalf}>
        <WordRecordLayout
          block={{
            ...word,
            foreign: foreignText,
            phonetic: phoneticText,
            meaning: word.meaning,
          }}
          imageAsset={imageMap[word.image]}
          showImage
          showTipIcon
          showInfoIcon
          showEnglish={showEnglish}
          onPlayAudio={playAudio}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onShowTip={() => setShowTip(true)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
          showSlowAudioIcon
          onSlowAudioPress={playSlowAudio}
        />

        {mode === 'explore' && (
          <TouchableOpacity style={styles.tickIconWrapper} onPress={handleAdvanceToStage1}>
            <View style={styles.tickIconCircle}>
              <MaterialCommunityIcons
                name={stage >= 1 ? 'check-circle' : 'check-circle-outline'}
                size={32}
                color={stage >= 1 ? 'limegreen' : 'gray'}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.interactionBlock} pointerEvents="box-none">
        <WordInteractionBlock
          block={{
            ...word,
            foreign: foreignText,
            phonetic: phoneticText,
          }}
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
    position: 'relative',
  },
  tickIconWrapper: {
    position: 'absolute',
    bottom: 36,
    right: 20,
    zIndex: 5,
  },
  tickIconCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    padding: 6,
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
