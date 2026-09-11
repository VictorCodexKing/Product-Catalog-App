import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  message?: string;
  onRetry: () => void;
}

/**
 * Footer affordance shown when loading an additional page fails. Keeps the
 * already-loaded list visible while giving the user an explicit "tap to retry"
 * so a persistent pagination failure is recoverable rather than silent.
 */
export default function LoadMoreError({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {message ?? 'Could not load more products.'}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading more products"
      >
        <Text style={styles.buttonText}>Tap to retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  message: {
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonPressed: {
    backgroundColor: '#b91c1c',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
