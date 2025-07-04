// components/RecorderBlock.js
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecorderBlock({ onRecordingFinished }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [error, setError] = useState('');
  const recordingRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    if (isRecording) return;
    setIsRecording(true);
    setError('');

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecording(recording);
      await recording.startAsync();
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      setError('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      console.log('✅ Recording saved at:', uri);
      onRecordingFinished(uri);
      setRecording(null);
      recordingRef.current = null;
    } catch (err) {
      console.error('❌ Failed to stop recording:', err);
      setError('Failed to stop recording');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording ? styles.recording : styles.idle,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <FontAwesome
          name="microphone"
          size={28}
          color={isRecording ? 'white' : 'black'}
        />
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  recordButton: {
    borderRadius: 50,
    padding: 20,
  },
  idle: {
    backgroundColor: '#FFD700', // yellow
  },
  recording: {
    backgroundColor: 'red',
  },
  error: {
    color: 'red',
    marginTop: 6,
  },
});
