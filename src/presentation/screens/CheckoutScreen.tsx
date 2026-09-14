import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

/**
 * Checkout screen placeholder. Reached after "Buy Now" from the add-to-cart
 * sheet. It summarises the selected item and quantity; the actual payment /
 * order flow is intentionally left as a TODO ("checkout page later").
 */
export default function CheckoutScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { title, unitPrice, quantity } = route.params;
  const total = unitPrice * quantity;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.card}>
        <Text style={styles.badge}>Order summary</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Unit price</Text>
          <Text style={styles.value}>{`$${unitPrice.toFixed(2)}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{quantity}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{`$${total.toFixed(2)}`}</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Checkout / payment is coming soon. This screen is a placeholder that
        confirms what would be purchased.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: '#6b7280',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  note: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 20,
    lineHeight: 20,
  },
});
