import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/** Full-screen loading indicator shown during the initial fetch. */
export default function LoadingState() {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.text}>Loading products…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
});
