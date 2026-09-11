import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../../domain/product';
import RemoteImage from './RemoteImage';

interface Props {
  product: Product;
  onPress: (id: number) => void;
}

/**
 * A single tappable product row showing its thumbnail, title, and price.
 * The thumbnail (via {@link RemoteImage}) shows a lightweight spinner
 * placeholder while loading and a neutral fallback if the image fails.
 */
export default function ProductCard({ product, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(product.id)}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, $${product.price.toFixed(2)}`}
    >
      <RemoteImage uri={product.thumbnail} style={styles.thumbnail} />

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>{`$${product.price.toFixed(2)}`}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  cardPressed: {
    backgroundColor: '#f3f4f6',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563eb',
  },
});
