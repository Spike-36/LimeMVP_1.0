import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function ProgressIconButton({ wordId, currentStage, onProgressed }) {
  const [stage, setStage] = useState(currentStage);
  const [scale] = useState(new Animated.Value(1));

  const isComplete = stage >= 4;

  const handlePress = async () => {
    if (!wordId || isComplete) return;

    const nextStage = stage + 1;
    await updateWordStage(wordId, nextStage);
    const updated = await loadProgress();
    const newStage = getStage(updated, wordId);
    setStage(newStage);
    if (onProgressed) onProgressed(newStage);

    // Animate bounce
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={isComplete}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialCommunityIcons
          name={isComplete ? 'check-circle' : 'check-circle-outline'}
          size={36}
          color={isComplete ? 'limegreen' : 'gray'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
