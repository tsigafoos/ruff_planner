import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/components/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && { backgroundColor: theme.primary },
        variant === 'secondary' && {
          backgroundColor: Platform.OS === 'web' ? theme.surfaceSecondary : theme.surfaceSecondary,
          borderWidth: 1,
          borderColor: theme.border,
        },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : theme.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && { color: theme.text },
            variant === 'ghost' && { color: theme.primary },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
});
