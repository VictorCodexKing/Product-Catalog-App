import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { StatusFilter } from '../../domain/product';

interface Props {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  category: string | null;
  categories: string[];
  onCategoryChange: (category: string | null) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

function statusLabel(status: StatusFilter): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? 'Status';
}

/**
 * A row of two dropdown-style filter chips ("Status" and "Category"), modelled
 * on the reference design. Tapping a chip opens a lightweight bottom-sheet of
 * options. Filtering itself is delegated to the pure `filterProducts` domain
 * helper by the screen; this component only manages selection UI.
 */
export default function FilterBar({
  status,
  onStatusChange,
  category,
  categories,
  onCategoryChange,
}: Props) {
  const [open, setOpen] = useState<null | 'status' | 'category'>(null);

  const statusActive = status !== 'all';
  const categoryActive = category !== null;

  return (
    <View style={styles.row}>
      <Chip
        label={statusActive ? statusLabel(status) : 'Status'}
        active={statusActive}
        onPress={() => setOpen('status')}
      />
      <Chip
        label={categoryActive ? (category as string) : 'Category'}
        active={categoryActive}
        capitalize
        onPress={() => setOpen('category')}
      />

      <Modal
        visible={open !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>
              {open === 'status' ? 'Filter by status' : 'Filter by category'}
            </Text>
            <ScrollView style={styles.optionsScroll}>
              {open === 'status'
                ? STATUS_OPTIONS.map((option) => (
                    <Option
                      key={option.value}
                      label={option.label}
                      selected={status === option.value}
                      onPress={() => {
                        onStatusChange(option.value);
                        setOpen(null);
                      }}
                    />
                  ))
                : [
                    <Option
                      key="__all"
                      label="All categories"
                      selected={category === null}
                      onPress={() => {
                        onCategoryChange(null);
                        setOpen(null);
                      }}
                    />,
                    ...categories.map((c) => (
                      <Option
                        key={c}
                        label={c}
                        capitalize
                        selected={category === c}
                        onPress={() => {
                          onCategoryChange(c);
                          setOpen(null);
                        }}
                      />
                    )),
                  ]}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Chip({
  label,
  active,
  capitalize,
  onPress,
}: {
  label: string;
  active: boolean;
  capitalize?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.chipText,
          active && styles.chipTextActive,
          capitalize && styles.capitalize,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text style={[styles.caret, active && styles.chipTextActive]}>▾</Text>
    </Pressable>
  );
}

function Option({
  label,
  selected,
  capitalize,
  onPress,
}: {
  label: string;
  selected: boolean;
  capitalize?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.option} onPress={onPress} accessibilityRole="button">
      <Text
        style={[
          styles.optionText,
          selected && styles.optionTextSelected,
          capitalize && styles.capitalize,
        ]}
      >
        {label}
      </Text>
      {selected ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    maxWidth: 130,
  },
  chipTextActive: {
    color: '#2563eb',
  },
  caret: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '60%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  optionsScroll: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '700',
  },
  check: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '700',
  },
});
