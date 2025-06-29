import { StyleSheet, Text, View } from 'react-native';

export default function ReviewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Review Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  text: { color: 'white', fontSize: 24 },
});
