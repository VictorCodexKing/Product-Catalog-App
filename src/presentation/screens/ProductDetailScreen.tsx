import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

/**
 * Placeholder detail screen. FEAT-003 fills this in with the product's full
 * description, price, rating, and image gallery. For now it simply confirms
 * the route wiring by echoing the product id received via params.
 */
export default function ProductDetailScreen({ route }: Props) {
  const { id } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product #{id}</Text>
      <Text style={styles.subtitle}>Details coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
});
