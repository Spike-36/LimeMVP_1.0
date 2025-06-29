import { StyleSheet, Text, View } from 'react-native';

export default function LearnScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📘 Learn Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  text: { color: 'white', fontSize: 24 },
});
