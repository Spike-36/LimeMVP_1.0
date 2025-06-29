// components/StageAdvanceButton.js

import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { loadProgress, updateWordStage } from '../utils/progressStorage';

const stageLabels = ['Learn', 'Listen', 'Speak', 'Review'];

export default function StageAdvanceButton({
  wordId,
  currentStage,
  onStageChange,
  requiredStage = 0, // defaults to 0 (Explore screen)
}) {
  if (currentStage == null || currentStage !== requiredStage || currentStage >= 4) return null;

  const nextStage = currentStage + 1;

  const handleAdvance = async () => {
    await updateWordStage(wordId, nextStage);
    const updated = await loadProgress();
    onStageChange(nextStage, updated);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleAdvance}>
      <Text style={styles.buttonText}>{stageLabels[currentStage]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 128, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: 'lime',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
