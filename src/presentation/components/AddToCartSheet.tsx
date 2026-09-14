import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Product } from '../../domain/product';

interface Props {
  visible: boolean;
  product: Product;
  /** Max selectable quantity (defaults to the product stock, min 1). */
  maxQuantity?: number;
  onClose: () => void;
  /** Called with the chosen quantity when the user taps Buy Now. */
  onBuyNow: (quantity: number) => void;
}

/**
 * A bottom-sheet popup for choosing a quantity before buying. Slides up from
 * the footer's Add to Cart button, shows a quantity stepper bounded by the
 * available stock, a live total, and a Buy Now action. The parent remounts
 * this sheet on each open (via a changing `key`), so quantity starts at 1
 * every time without needing a reset effect.
 */
export default function AddToCartSheet({
  visible,
  product,
  maxQuantity,
  onClose,
  onBuyNow,
}: Props) {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);

  const max = Math.max(1, maxQuantity ?? product.stock ?? 99);

  const total = product.price * quantity;
  const canDecrement = quantity > 1;
  const canIncrement = quantity < max;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]} onPress={() => {}}>
          <View style={styles.handle} />

          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.unitPrice}>{`$${product.price.toFixed(2)} each`}</Text>

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.stepper}>
              <Pressable
                style={[styles.stepBtn, !canDecrement && styles.stepBtnDisabled]}
                onPress={() => canDecrement && setQuantity((q) => q - 1)}
                disabled={!canDecrement}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue} accessibilityLabel={`Quantity ${quantity}`}>
                {quantity}
              </Text>
              <Pressable
                style={[styles.stepBtn, !canIncrement && styles.stepBtnDisabled]}
                onPress={() => canIncrement && setQuantity((q) => q + 1)}
                disabled={!canIncrement}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.stockHint}>{`${max} available`}</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{`$${total.toFixed(2)}`}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.buyBtn, pressed && styles.buyBtnPressed]}
            onPress={() => onBuyNow(quantity)}
            accessibilityRole="button"
            accessibilityLabel={`Buy now, ${quantity} item${quantity > 1 ? 's' : ''}, total $${total.toFixed(2)}`}
          >
            <Text style={styles.buyText}>Buy Now</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  unitPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  qtyValue: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  stockHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  buyBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyBtnPressed: {
    opacity: 0.85,
  },
  buyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
