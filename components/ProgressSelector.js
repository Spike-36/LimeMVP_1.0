
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const STAGES = [
  { value: 1, label: 'Learning', color: 'gray' },
  { value: 2, label: 'Familiar', color: 'dodgerblue' },
  { value: 3, label: 'Confident', color: 'limegreen' },
  { value: 4, label: 'Mastered', color: 'gold' },
];

export default function ProgressSelector({ currentStage = 1, onSelect }) {
  return (
    <View style={styles.container}>
      {STAGES.map((stage) => (
        <TouchableOpacity
          key={stage.value}
          style={styles.option}
          onPress={() => onSelect(stage.value)}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="star"
            size={32}
            color={currentStage === stage.value ? stage.color : '#444'}
          />
          <Text
            style={[
              styles.label,
              currentStage === stage.value && { color: stage.color },
            ]}
          >
            {stage.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  option: {
    alignItems: 'center',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
  },
});
