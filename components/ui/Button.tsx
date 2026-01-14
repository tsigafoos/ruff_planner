import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Platform, View } from 'react-native';
import { useTheme } from '@/components/useTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  // Size configurations
  const sizeStyles = {
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      minHeight: 32,
      fontSize: 12,
      iconSize: 12,
    },
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      minHeight: Platform.OS === 'web' ? 40 : 44,
      fontSize: 14,
      iconSize: 14,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 28,
      minHeight: Platform.OS === 'web' ? 48 : 52,
      fontSize: 16,
      iconSize: 16,
    },
  };

  const currentSize = sizeStyles[size];
  
  // Text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'danger': return '#FFFFFF';
      case 'secondary': return theme.text;
      case 'ghost': return theme.primary;
      default: return theme.text;
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          minHeight: currentSize.minHeight,
        },
        variant === 'primary' && { backgroundColor: theme.primary },
        variant === 'secondary' && {
          backgroundColor: theme.surfaceSecondary,
          borderWidth: 1,
          borderColor: theme.border,
        },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        variant === 'danger' && { backgroundColor: theme.error },
        (disabled || loading) && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : theme.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <FontAwesome 
              name={icon as any} 
              size={currentSize.iconSize} 
              color={textColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              { fontSize: currentSize.fontSize, color: textColor },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <FontAwesome 
              name={icon as any} 
              size={currentSize.iconSize} 
              color={textColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
