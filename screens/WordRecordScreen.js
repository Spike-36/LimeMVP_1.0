import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordRecordLayout from '../components/WordRecordLayout';

export default function WordRecordScreen({ route }) {
  const navigation = useNavigation();
  const words = route.params?.words || [];
  const index = route.params?.index ?? 0;
  const word = words[index];

  const [sound, setSound] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // ✅ Debug log to verify dynamic data
  useEffect(() => {
    console.log('🧪 WordRecordScreen mounted');
    console.log('🧪 Received index:', index);
    console.log('🧪 Word record:', word);
  }, []);

  const audioAsset = word ? audioMap[word.audio] : null;
  const imageAsset = word ? imageMap[word.image] : null;

  useEffect(() => {
    let loadedSound;

    const loadAudio = async () => {
      if (audioAsset) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(audioAsset);
          setSound(newSound);
          loadedSound = newSound;
        } catch (err) {
          console.warn('❌ Failed to preload audio:', err);
        }
      }
    };

    loadAudio();

    return () => {
      if (loadedSound) {
        loadedSound.unloadAsync();
      }
    };
  }, [word?.audio]);

  const playAudio = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        console.warn('⚠️ Audio playback error:', e);
      }
    }
  };

  const goToPrev = () => {
    if (index > 0) {
      navigation.replace('WordRecord', {
        words,
        index: index - 1,
      });
    }
  };

  const goToNext = () => {
    if (index < words.length - 1) {
      navigation.replace('WordRecord', {
        words,
        index: index + 1,
      });
    }
  };

  if (!word) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.error}>⚠️ Word not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <WordRecordLayout
        block={word}
        imageAsset={imageAsset}
        showImage={true}
        showTipIcon={true}
        showInfoIcon={true}
        showEnglish={showEnglish}
        onPlayAudio={playAudio}
        onToggleEnglish={() => setShowEnglish(!showEnglish)}
        onShowTip={() => setShowTip(true)}
      />

      {showTip && (
        <View style={styles.tipOverlay}>
          <Text style={styles.tipText}>{word.tip}</Text>
          <Text style={styles.closeTip} onPress={() => setShowTip(false)}>✕</Text>
        </View>
      )}

      <View style={styles.navButtons}>
        <TouchableOpacity onPress={goToPrev} disabled={index === 0}>
          <FontAwesome
            name="chevron-left"
            size={32}
            color={index === 0 ? 'gray' : '#FFD700'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNext} disabled={index === words.length - 1}>
          <FontAwesome
            name="chevron-right"
            size={32}
            color={index === words.length - 1 ? 'gray' : '#FFD700'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    paddingVertical: 20,
  },
});
