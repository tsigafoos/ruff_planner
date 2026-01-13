import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function Card({ children, style }: CardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
});
