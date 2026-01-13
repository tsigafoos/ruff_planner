import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/components/useTheme';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  mode?: 'date' | 'time' | 'datetime';
}

export default function DatePicker({
  value,
  onChange,
  label,
  mode = 'date',
}: DatePickerProps) {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<any>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (value) {
      setTextValue(formatDateForInput(value));
    } else {
      setTextValue('');
    }
  }, [value]);

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // Web version - render actual HTML5 date input
  if (Platform.OS === 'web') {
    useEffect(() => {
      if (typeof document === 'undefined' || !inputRef.current) return;

      const input = inputRef.current as HTMLInputElement;
      if (input.type === 'date') {
        input.value = textValue;
      }
    }, [textValue]);

    return (
      <View style={styles.container}>
        {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
        <View style={[styles.webInputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <input
            ref={inputRef}
            type="date"
            value={textValue}
            onChange={(e) => {
              const dateStr = e.target.value;
              setTextValue(dateStr);
              if (dateStr) {
                const date = new Date(dateStr + 'T00:00:00');
                if (!isNaN(date.getTime())) {
                  onChange(date);
                }
              } else {
                onChange(undefined);
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: theme.text,
              background: 'transparent',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              padding: 0,
              width: '100%',
              minHeight: '24px',
            }}
          />
          {value && (
            <TouchableOpacity
              onPress={() => {
                setTextValue('');
                onChange(undefined);
                if (inputRef.current) {
                  (inputRef.current as HTMLInputElement).value = '';
                }
              }}
              style={styles.clearButton}
            >
              <Text style={[styles.clearText, { color: theme.textTertiary }]}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Native version using DateTimePicker
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.button, { borderColor: theme.border, backgroundColor: theme.surface }]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>
          {value ? formatDate(value) : 'Select date'}
        </Text>
        {value && (
          <TouchableOpacity
            onPress={() => onChange(undefined)}
            style={styles.clearButton}
          >
            <Text style={[styles.clearText, { color: theme.textTertiary }]}>×</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
  },
  webInputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearText: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    lineHeight: Platform.OS === 'web' ? 20 : 24,
  },
});
