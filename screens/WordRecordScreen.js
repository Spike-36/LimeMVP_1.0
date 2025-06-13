import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';

export default function WordRecordScreen({ route, navigation }) {
  const { words, index } = route.params;
  const word = words[index];
  const imageSource = imageMap[word.image];
  const soundRef = useRef(null);

  const playAudio = async () => {
    if (!word.audio || !audioMap[word.audio]) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true, // ✅ override silent switch
      });

      const { sound } = await Audio.Sound.createAsync(audioMap[word.audio]);
      await sound.setVolumeAsync(1.0); // ✅ force full volume
      soundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.warn('🎧 Playback error:', err);
    }
  };

  useEffect(() => {
    playAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [word]);

  const goNext = () => {
    if (index < words.length - 1) {
      navigation.push('WordRecord', { words, index: index + 1 });
    }
  };

  const goPrev = () => {
    if (index > 0) {
      navigation.push('WordRecord', { words, index: index - 1 });
    }
  };

  return (
    <View style={styles.container}>
      {imageSource && <Image source={imageSource} style={styles.image} resizeMode="contain" />}
      <Text style={styles.term}>{word.english}</Text>
      <Text style={styles.translation}>{word.foreign}</Text>
      <Text style={styles.phonetic}>{word.phonetic}</Text>

      <TouchableOpacity onPress={playAudio} style={styles.playButton}>
        <Text style={styles.playText}>🔊 Play</Text>
      </TouchableOpacity>

      <View style={styles.navButtons}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0}>
          <Text style={[styles.navText, index === 0 && styles.disabled]}>◀ Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} disabled={index === words.length - 1}>
          <Text style={[styles.navText, index === words.length - 1 && styles.disabled]}>Next ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
  },
  term: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  translation: {
    fontSize: 28,
    color: 'white',
    marginBottom: 8,
  },
  phonetic: {
    fontSize: 20,
    color: '#aaa',
  },
  playButton: {
    backgroundColor: '#FFD70020',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 20,
  },
  playText: {
    color: '#FFD700',
    fontSize: 18,
  },
  navButtons: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 40,
  },
  navText: {
    fontSize: 18,
    color: '#FFD700',
  },
  disabled: {
    color: '#555',
  },
});
