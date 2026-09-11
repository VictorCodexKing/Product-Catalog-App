import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Product } from '../../domain/product';

interface Props {
  product: Product;
  onPress: (id: number) => void;
}

/**
 * A single tappable product row showing its thumbnail, title, and price.
 * The thumbnail shows a lightweight spinner placeholder while loading and a
 * neutral fallback if the image fails to load.
 */
export default function ProductCard({ product, onPress }: Props) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(product.id)}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, $${product.price.toFixed(2)}`}
    >
      <View style={styles.thumbnailWrapper}>
        {!imageError ? (
          <Image
            source={{ uri: product.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Text style={styles.thumbnailFallbackText}>No image</Text>
          </View>
        )}
        {imageLoading && !imageError ? (
          <ActivityIndicator style={styles.thumbnailSpinner} color="#6b7280" />
        ) : null}
      </View>

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
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailSpinner: {
    position: 'absolute',
  },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailFallbackText: {
    fontSize: 11,
    color: '#9ca3af',
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
