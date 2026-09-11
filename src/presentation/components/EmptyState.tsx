import { StyleSheet, Text, View } from 'react-native';

interface Props {
  message?: string;
}

/**
 * Empty view shown when a fetch succeeds but returns no products (e.g. a search
 * with no matches). Visually distinct via a muted, neutral treatment.
 */
export default function EmptyState({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.title}>No products found</Text>
      <Text style={styles.message}>
        {message ?? 'Try a different search term.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
