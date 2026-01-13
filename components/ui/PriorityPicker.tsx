import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const priorities = [
  { level: 1, label: 'Low', color: '#10B981', icon: 'circle' },
  { level: 2, label: 'Medium', color: '#3B82F6', icon: 'circle' },
  { level: 3, label: 'High', color: '#F59E0B', icon: 'circle' },
  { level: 4, label: 'Urgent', color: '#EF4444', icon: 'circle' },
];

interface PriorityPickerProps {
  value: number;
  onChange: (priority: number) => void;
  label?: string;
}

export default function PriorityPicker({ value, onChange, label }: PriorityPickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.options}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.level}
            style={[
              styles.option,
              value === priority.level && styles.optionSelected,
            ]}
            onPress={() => onChange(priority.level)}
          >
            <FontAwesome
              name={priority.icon as any}
              size={16}
              color={priority.color}
              style={styles.icon}
            />
            <Text
              style={[
                styles.optionText,
                value === priority.level && { color: priority.color, fontWeight: '600' },
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    color: '#374151',
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  icon: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
});
