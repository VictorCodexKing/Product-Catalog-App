import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { Category } from '../../domain/product';

interface Props {
  categories: Category[];
  /** The selected category slug, or null for "All". */
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

/**
 * A horizontally scrolling row of category buttons (a carousel), modelled on
 * the reference design. The first chip is "All" (clears the filter); the rest
 * list every category returned by the API. The selected chip is filled dark.
 */
export default function CategoryCarousel({ categories, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      <CategoryChip
        label="All"
        active={selected === null}
        onPress={() => onSelect(null)}
      />
      {categories.map((category) => (
        <CategoryChip
          key={category.slug}
          label={category.name}
          active={selected === category.slug}
          onPress={() => onSelect(category.slug)}
        />
      ))}
    </ScrollView>
  );
}

function CategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} category`}
    >
      <Text
        style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#ffffff',
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: '#111827',
  },
  chipInactive: {
    backgroundColor: '#f3f4f6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: '#374151',
  },
});
