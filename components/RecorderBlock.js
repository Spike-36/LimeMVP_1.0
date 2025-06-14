import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RecorderBlock({ onRecordingFinished }) {
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (e) {}
        recordingRef.current = null;
      }

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
      setIsRecording(false);
      console.log('🎤 Recording saved at:', uri);
      if (onRecordingFinished) onRecordingFinished(uri);
    } catch (err) {
      console.error('❌ Failed to stop recording:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.stop]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <MaterialIcons
          name={isRecording ? 'stop' : 'mic'}
          size={32}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  recordButton: {
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stop: {
    backgroundColor: '#388e3c',
  },
});
