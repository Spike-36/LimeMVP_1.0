import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

export default function StageProgressFeedback({
  message = 'Nice work!',
  duration = 1800,
  onComplete = () => {},
  soundEffect = null, // pass a key for audioMap if needed
  haptic = true,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animateIn = () => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const cleanup = async () => {
      if (haptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (soundEffect) {
        try {
          const { sound } = await Audio.Sound.createAsync(soundEffect);
          await sound.playAsync();
          setTimeout(() => sound.unloadAsync(), 1000);
        } catch (e) {
          console.warn('StageProgressFeedback: sound failed', e);
        }
      }

      animateIn();
      setTimeout(onComplete, duration);
    };

    cleanup();
  }, []);

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  message: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
