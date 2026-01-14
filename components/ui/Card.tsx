import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../useTheme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle | ViewStyle[];
}

export default function Card({ 
  children, 
  variant = 'default',
  padding = 'medium',
  style 
}: CardProps) {
  const theme = useTheme();

  // Padding values
  const paddingValues = {
    none: 0,
    small: 10,
    medium: 16,
    large: 24,
  };

  // Get variant-specific styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.surface,
          borderWidth: 0,
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }),
        } as ViewStyle;
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'flat':
        return {
          backgroundColor: theme.surfaceSecondary,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
        };
    }
  };

  return (
    <View 
      style={[
        styles.card, 
        getVariantStyles(),
        { padding: paddingValues[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
