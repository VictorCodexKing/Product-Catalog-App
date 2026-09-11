import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  availabilityLabel,
  isInStock,
  originalPrice,
  type Product,
  type Review,
} from '../../domain/product';
import type { RootStackParamList } from '../navigation/types';
import { useProductDetail } from '../hooks/useProductDetail';
import RemoteImage from '../components/RemoteImage';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

/** Renders a rating as filled/half/empty stars followed by the numeric value. */
function RatingStars({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  const rounded = Math.round(rating * 2) / 2;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const position = i + 1;
    if (rounded >= position) return '★';
    if (rounded >= position - 0.5) return '⯪';
    return '☆';
  }).join('');

  return (
    <Text
      style={[styles.ratingStars, { fontSize: size }]}
      accessibilityLabel={`Rated ${rating} out of 5`}
    >
      {stars}
    </Text>
  );
}

/** A single review row: reviewer, star rating, comment, and formatted date. */
function ReviewItem({ review }: { review: Review }) {
  const date = new Date(review.date);
  const formattedDate = Number.isNaN(date.getTime())
    ? review.date
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  return (
    <View style={styles.review}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewer}>{review.reviewerName}</Text>
        <RatingStars rating={review.rating} size={14} />
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <Text style={styles.reviewDate}>{formattedDate}</Text>
    </View>
  );
}

/** A labelled key/value cell used in the dimensions grid. */
function DimensionCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dimCell}>
      <Text style={styles.dimValue}>{value}</Text>
      <Text style={styles.dimLabel}>{label}</Text>
    </View>
  );
}

/**
 * Success view: image gallery, title, availability, price (with discount and
 * original price), rating, brand/category, full description, dimensions, and
 * the full list of reviews with their ratings.
 */
function ProductDetail({ product }: { product: Product }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const galleryImages = product.images.length > 0 ? product.images : [product.thumbnail];
  const meta = [product.brand, product.category].filter(Boolean).join(' • ');
  const inStock = isInStock(product);
  const status = availabilityLabel(product);
  const discount = product.discountPercentage ?? 0;
  const hasDiscount = discount > 0;
  const original = originalPrice(product.price, product.discountPercentage);
  const dims = product.dimensions;
  const reviews = product.reviews ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={[styles.gallery, { height: width }]}
      >
        {galleryImages.map((uri, index) => (
          <RemoteImage
            key={`${uri}-${index}`}
            uri={uri}
            resizeMode="contain"
            style={[styles.galleryImage, { width, height: width }]}
          />
        ))}
      </ScrollView>

      <View style={styles.body}>
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

        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{`$${product.price.toFixed(2)}`}</Text>
          {original ? (
            <Text style={styles.originalPrice}>{`$${original.toFixed(2)}`}</Text>
          ) : null}
          {hasDiscount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{`-${discount.toFixed(0)}%`}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.ratingRow}>
          <RatingStars rating={product.rating} />
          <Text style={styles.ratingValue}>
            {`${product.rating.toFixed(2)}${reviews.length > 0 ? ` · ${reviews.length} reviews` : ''}`}
          </Text>
        </View>

        {meta.length > 0 ? <Text style={styles.meta}>{meta}</Text> : null}

        {product.tags && product.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {product.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {dims ? (
          <>
            <Text style={styles.sectionTitle}>Dimensions</Text>
            <View style={styles.dimGrid}>
              <DimensionCell label="Width" value={`${dims.width}`} />
              <DimensionCell label="Height" value={`${dims.height}`} />
              <DimensionCell label="Depth" value={`${dims.depth}`} />
              {typeof product.weight === 'number' ? (
                <DimensionCell label="Weight" value={`${product.weight}`} />
              ) : null}
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>
          {`Reviews${reviews.length > 0 ? ` (${reviews.length})` : ''}`}
        </Text>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewItem key={`${review.reviewerEmail}-${index}`} review={review} />
          ))
        ) : (
          <Text style={styles.noReviews}>No reviews yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

/**
 * Product detail screen. Reads the product id from route params, loads the
 * product via {@link useProductDetail}, and shows distinct loading / error
 * (with Retry) / success views.
 */
export default function ProductDetailScreen({ route }: Props) {
  const { id } = route.params;
  const { status, product, error, retry } = useProductDetail(id);

  if (status === 'loading') {
    return <LoadingState />;
  }
  if (status === 'error' || !product) {
    return <ErrorState message={error?.message} onRetry={retry} />;
  }
  return <ProductDetail product={product} />;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
  },
  gallery: {
    backgroundColor: '#f3f4f6',
  },
  galleryImage: {
    backgroundColor: '#f3f4f6',
  },
  body: {
    padding: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
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
    marginRight: 6,
  },
  dotInStock: {
    backgroundColor: '#16a34a',
  },
  dotOutStock: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextIn: {
    color: '#15803d',
  },
  statusTextOut: {
    color: '#b91c1c',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 15,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  discountBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  discountText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingStars: {
    color: '#f59e0b',
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: '#eef2ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338ca',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  dimGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dimCell: {
    minWidth: 72,
    flexGrow: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  dimValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dimLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  review: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noReviews: {
    fontSize: 14,
    color: '#6b7280',
  },
});
