import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { loadProgress, updateWordStage } from '../utils/progressStorage';

const stageLabels = ['Learn', 'Listen', 'Speak', 'Review'];

export default function StageAdvanceButton({
  wordId,
  currentStage,
  onStageChange,
  requiredStage = 0,
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
    bottom: 40,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#555',
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buttonText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
