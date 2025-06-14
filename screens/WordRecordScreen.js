import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';

export default function WordRecordScreen({ route, navigation }) {
  const { words, index } = route.params;
  const word = words[index];
  const imageSource = imageMap[word.image];
  const soundRef = useRef(null);

  const recordingRef = useRef(null);
  const recordedSoundRef = useRef(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    if (!word.audio || !audioMap[word.audio]) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(audioMap[word.audio]);
      await sound.setVolumeAsync(1.0);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.warn('🎧 Playback error:', err);
    }
  };

  const startRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      if (recordedSoundRef.current) {
        await recordedSoundRef.current.unloadAsync();
        recordedSoundRef.current = null;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('❌ Mic permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setRecordingUri(uri);
      setIsRecording(false);
      console.log('✅ Recording saved at:', uri);
    } catch (err) {
      console.error('❌ Failed to stop recording:', err);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;
    try {
      if (recordedSoundRef.current) {
        await recordedSoundRef.current.unloadAsync();
        recordedSoundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      recordedSoundRef.current = sound;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      await sound.setVolumeAsync(1.0);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });

      await sound.playAsync();
      console.log('▶️ Playback started');
    } catch (err) {
      console.error('❌ Playback failed:', err);
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
      {imageSource && (
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      )}

      <Text style={styles.term}>{word.english}</Text>
      <Text style={styles.translation}>{word.foreign}</Text>
      <Text style={styles.phonetic}>{word.phonetic}</Text>

      <TouchableOpacity onPress={playAudio} style={styles.playButton}>
        <Text style={styles.playText}>🔊 Play</Text>
      </TouchableOpacity>

      <View style={styles.recorderContainer}>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.recButton, isRecording ? styles.stop : styles.record]}
        >
          <Text style={styles.recText}>{isRecording ? 'Stop' : 'Record'}</Text>
        </TouchableOpacity>

        {recordingUri && (
          <TouchableOpacity onPress={playRecording} disabled={isPlaying} style={styles.playBackBtn}>
            <Text style={styles.playBackText}>{isPlaying ? 'Playing...' : '▶️ Play Recording'}</Text>
          </TouchableOpacity>
        )}
      </View>

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
  recorderContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  recButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 10,
  },
  record: {
    backgroundColor: '#d32f2f',
  },
  stop: {
    backgroundColor: '#388e3c',
  },
  recText: {
    color: 'white',
    fontSize: 18,
  },
  playBackBtn: {
    backgroundColor: '#FFD70020',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  playBackText: {
    color: '#FFD700',
    fontSize: 16,
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