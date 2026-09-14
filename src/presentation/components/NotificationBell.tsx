import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  /** Whether to show the unread red dot. */
  hasUnread?: boolean;
  onPress?: () => void;
}

/**
 * A circular notification bell button with an unread red-dot badge, modelled
 * on the reference design and intended for the top-right of the list header.
 * The action is a placeholder for a future notifications screen.
 */
export default function NotificationBell({ hasUnread = true, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasUnread ? 'Notifications, unread' : 'Notifications'
      }
      hitSlop={8}
    >
      <Text style={styles.icon}>🔔</Text>
      {hasUnread ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#f3f4f6',
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
});
