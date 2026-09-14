import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * A modern rounded search field with a dark circular search affordance on the
 * right, modelled on the reference design. Purely presentational — search is
 * live/debounced by the parent, so the button is a visual affordance rather
 * than a submit action.
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search property',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search products"
        />
        <View style={styles.searchButton}>
          <Text style={styles.searchIcon}>⌕</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 6,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '700',
  },
});
