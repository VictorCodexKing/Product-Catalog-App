import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  filterProducts,
  uniqueCategories,
  type Product,
  type StatusFilter,
} from '../../domain/product';
import type { RootStackParamList } from '../navigation/types';
import { useDebounce } from '../hooks/useDebounce';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadMoreError from '../components/LoadMoreError';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

/**
 * The product catalog list screen: a debounced search box over a paginated
 * FlatList of products, with Status/Category filter chips and distinct
 * loading / error / empty / success views.
 *
 * Search is server-side (resets pagination for the query); the Status and
 * Category chips are lightweight client-side filters applied to the products
 * loaded so far, via the pure `filterProducts` domain helper.
 */
export default function ProductListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const {
    status,
    products,
    hasMore,
    refreshing,
    loadingMore,
    error,
    loadMoreError,
    loadMore,
    retry,
    refresh,
    retryLoadMore,
  } = useProducts(debouncedQuery);

  const categories = useMemo(() => uniqueCategories(products), [products]);
  const visibleProducts = useMemo(
    () => filterProducts(products, statusFilter, categoryFilter),
    [products, statusFilter, categoryFilter],
  );

  const filtersActive = statusFilter !== 'all' || categoryFilter !== null;

  const handlePressProduct = useCallback(
    (id: number) => navigation.navigate('ProductDetail', { id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onPress={handlePressProduct} />
    ),
    [handlePressProduct],
  );

  const renderFooter = useCallback(() => {
    if (loadMoreError) {
      return (
        <LoadMoreError message={loadMoreError.message} onRetry={retryLoadMore} />
      );
    }
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }, [loadMoreError, loadingMore, retryLoadMore]);

  const renderEmptyList = useCallback(() => {
    // Success status but the active filters hid every loaded product.
    if (filtersActive) {
      return (
        <View style={styles.filterEmpty}>
          <Text style={styles.filterEmptyText}>
            No loaded products match the selected filters.
          </Text>
        </View>
      );
    }
    return null;
  }, [filtersActive]);

  const renderBody = () => {
    if (status === 'loading') {
      return <LoadingState />;
    }
    if (status === 'error') {
      return <ErrorState message={error?.message} onRetry={retry} />;
    }
    if (status === 'empty') {
      return (
        <EmptyState
          message={
            debouncedQuery.trim().length > 0
              ? `No products match "${debouncedQuery.trim()}".`
              : 'There are no products to show.'
          }
        />
      );
    }
    return (
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={hasMore && !loadMoreError ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products…"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search products"
        />
      </View>
      <FilterBar
        status={statusFilter}
        onStatusChange={setStatusFilter}
        category={categoryFilter}
        categories={categories}
        onCategoryChange={setCategoryFilter}
      />
      <View style={styles.body}>{renderBody()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 16,
  },
  filterEmpty: {
    padding: 32,
    alignItems: 'center',
  },
  filterEmptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
});
