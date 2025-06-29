// components/WordInteractionBlock.js
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WordInteractionBlock({
  block,
  stage = 0,
  onStageChange = () => {},
  onPlayAudio = () => {},
  onInstructionPress = () => {},
  instructionText = '',
  showStars = true,
  showInstruction = true,
  style = {},
}) {
  return (
    <View style={[styles.container, style]}>
      {showStars && (
        <View style={styles.stars}>
          {[0, 1, 2, 3].map((level) => (
            <TouchableOpacity key={level} onPress={() => onStageChange(level + 1)}>
              <FontAwesome
                name={stage > level ? 'star' : 'star-o'}
                size={24}
                color={stage > level ? '#FFD700' : '#555'}
                style={{ marginHorizontal: 15 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.phonetic}>{block?.phonetic}</Text>

      <TouchableOpacity onPress={onPlayAudio}>
        <Text style={styles.foreign}>{block?.foreign}</Text>
      </TouchableOpacity>

      {showInstruction && instructionText ? (
        <TouchableOpacity onPress={onInstructionPress}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{instructionText}</Text>
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  phonetic: {
    color: '#FFD700',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 25,
  },
  foreign: {
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionBox: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
  },
});