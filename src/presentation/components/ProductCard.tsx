import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  availabilityLabel,
  isInStock,
  type Product,
} from '../../domain/product';
import RemoteImage from './RemoteImage';

interface Props {
  product: Product;
  onPress: (id: number) => void;
}

/**
 * A single tappable product row. Inspired by the reference design but adapted
 * to the requested variations:
 *  - a coloured availability pill ("In Stock" / "Out of Stock") replaces the
 *    generic "Active" status,
 *  - a discount badge sits on the thumbnail when the product is discounted,
 *  - the product's tags (e.g. "beauty", "mascara") are shown instead of a
 *    single colour swatch, alongside the price and remaining stock.
 *
 * The thumbnail (via {@link RemoteImage}) shows a spinner placeholder while
 * loading and a neutral fallback if the image fails.
 */
export default function ProductCard({ product, onPress }: Props) {
  const inStock = isInStock(product);
  const status = availabilityLabel(product);
  const discount = product.discountPercentage ?? 0;
  const hasDiscount = discount > 0;
  const tags = product.tags ?? [];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(product.id)}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, $${product.price.toFixed(2)}, ${status}`}
    >
      <View style={styles.thumbWrap}>
        <RemoteImage uri={product.thumbnail} style={styles.thumbnail} />
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{`-${discount.toFixed(0)}%`}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.details}>
        <View
          style={[styles.statusPill, inStock ? styles.statusInStock : styles.statusOutStock]}
        >
          <View
            style={[styles.statusDot, inStock ? styles.dotInStock : styles.dotOutStock]}
          />
          <Text
            style={[
              styles.statusText,
              inStock ? styles.statusTextIn : styles.statusTextOut,
            ]}
          >
            {status}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{`$${product.price.toFixed(2)}`}</Text>
          {typeof product.stock === 'number' ? (
            <Text style={styles.stock}>{`· ${product.stock} stocks`}</Text>
          ) : null}
        </View>

        {tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  thumbWrap: {
    width: 72,
    height: 72,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  statusInStock: {
    backgroundColor: '#dcfce7',
  },
  statusOutStock: {
    backgroundColor: '#fee2e2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  dotInStock: {
    backgroundColor: '#16a34a',
  },
  dotOutStock: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextIn: {
    color: '#15803d',
  },
  statusTextOut: {
    color: '#b91c1c',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  stock: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#eef2ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338ca',
    textTransform: 'capitalize',
  },
});
