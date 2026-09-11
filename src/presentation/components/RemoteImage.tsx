import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

interface Props {
  uri: string;
  /** Style applied to the wrapper view (sizing, borders, etc.). */
  style?: StyleProp<ViewStyle>;
  /** Optional override for the underlying image style; defaults to filling the wrapper. */
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** Label shown in the fallback view when the image fails to load. */
  fallbackText?: string;
  /** Color of the loading spinner. */
  spinnerColor?: string;
}

/**
 * A remote `Image` wrapper that shows a spinner placeholder while the image
 * loads (via `onLoadStart`/`onLoadEnd`) and a neutral fallback view if it
 * fails (via `onError`). Centralises the image loading/error handling used by
 * both the product card thumbnail and the detail gallery.
 */
export default function RemoteImage({
  uri,
  style,
  imageStyle,
  resizeMode = 'cover',
  fallbackText = 'No image',
  spinnerColor = '#6b7280',
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {!error ? (
        <Image
          source={{ uri }}
          style={[styles.image, imageStyle]}
          resizeMode={resizeMode}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{fallbackText}</Text>
        </View>
      )}
      {loading && !error ? (
        <ActivityIndicator style={styles.spinner} color={spinnerColor} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  spinner: {
    position: 'absolute',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
