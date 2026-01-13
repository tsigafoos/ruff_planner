import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '@/components/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

export default function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.error : theme.border,
            color: theme.text,
          },
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.textTertiary}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    // Error styling handled inline
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
