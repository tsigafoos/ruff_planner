import { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/useTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onIconPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  containerStyle?: any;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  onIconPress,
  size = 'medium',
  containerStyle,
  style,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Size configurations
  const sizeStyles = {
    small: {
      padding: 8,
      fontSize: 13,
      iconSize: 14,
      minHeight: 36,
    },
    medium: {
      padding: 12,
      fontSize: 14,
      iconSize: 16,
      minHeight: Platform.OS === 'web' ? 42 : 48,
    },
    large: {
      padding: 16,
      fontSize: 16,
      iconSize: 18,
      minHeight: Platform.OS === 'web' ? 50 : 56,
    },
  };

  const currentSize = sizeStyles[size];

  // Border color based on state
  const getBorderColor = () => {
    if (error) return theme.error;
    if (isFocused) return theme.primary;
    return theme.border;
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    const IconWrapper = onIconPress ? TouchableOpacity : View;
    const wrapperProps = onIconPress ? { onPress: onIconPress, hitSlop: { top: 10, bottom: 10, left: 10, right: 10 } } : {};
    
    return (
      <IconWrapper 
        style={[
          styles.iconContainer,
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
        ]}
        {...wrapperProps}
      >
        <FontAwesome 
          name={icon as any} 
          size={currentSize.iconSize} 
          color={isFocused ? theme.primary : theme.textTertiary} 
        />
      </IconWrapper>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View style={[
        styles.inputWrapper,
        {
          backgroundColor: theme.surfaceSecondary,
          borderColor: getBorderColor(),
          minHeight: currentSize.minHeight,
        },
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
      ]}>
        {icon && iconPosition === 'left' && renderIcon()}
        <TextInput
          style={[
            styles.input,
            {
              padding: currentSize.padding,
              paddingLeft: icon && iconPosition === 'left' ? 8 : currentSize.padding,
              paddingRight: icon && iconPosition === 'right' ? 8 : currentSize.padding,
              fontSize: currentSize.fontSize,
              color: theme.text,
            },
            props.multiline && styles.multiline,
            style,
          ]}
          placeholderTextColor={theme.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {icon && iconPosition === 'right' && renderIcon()}
      </View>
      {hint && !error && (
        <Text style={[styles.hintText, { color: theme.textTertiary }]}>{hint}</Text>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={12} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderWidth: 2,
  },
  inputWrapperError: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
  },
  multiline: {
    textAlignVertical: 'top',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLeft: {
    paddingLeft: 12,
  },
  iconRight: {
    paddingRight: 12,
  },
  hintText: {
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
  },
});
