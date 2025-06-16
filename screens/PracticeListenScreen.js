import { StyleSheet, Text, View } from 'react-native';

export default function PracticeListenScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎧 Practice Listening Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
