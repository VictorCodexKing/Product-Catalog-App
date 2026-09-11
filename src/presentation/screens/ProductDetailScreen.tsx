import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Product } from '../../domain/product';
import type { RootStackParamList } from '../navigation/types';
import { useProductDetail } from '../hooks/useProductDetail';
import RemoteImage from '../components/RemoteImage';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

/** Renders a rating as filled/half/empty stars followed by the numeric value. */
function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const position = i + 1;
    if (rounded >= position) return '★';
    if (rounded >= position - 0.5) return '⯪';
    return '☆';
  }).join('');

  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingStars} accessibilityLabel={`Rated ${rating} out of 5`}>
        {stars}
      </Text>
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
    </View>
  );
}

/** Success view: image gallery, title, price, rating, brand/category, description. */
function ProductDetail({ product }: { product: Product }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const galleryImages = product.images.length > 0 ? product.images : [product.thumbnail];
  const meta = [product.brand, product.category].filter(Boolean).join(' • ');

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
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{`$${product.price.toFixed(2)}`}</Text>

        <RatingStars rating={product.rating} />

        {meta.length > 0 ? <Text style={styles.meta}>{meta}</Text> : null}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingStars: {
    fontSize: 18,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
});
