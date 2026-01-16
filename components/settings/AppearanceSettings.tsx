import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../useTheme';
import { useThemeStore, ThemeMode } from '@/store/themeStore';
import { useIconPackage, IconPackage } from '../ui/Icon';

export type { IconPackage } from '../ui/Icon';

export default function AppearanceSettings() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeStore();
  const { iconPackage, setIconPackage } = useIconPackage();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleIconPackageChange = (pkg: IconPackage) => {
    setIconPackage(pkg);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        <FontAwesome name="paint-brush" size={18} color={theme.primary} /> Appearance
      </Text>

      {/* Theme Selection */}
      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Theme</Text>
        <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
          Choose between dark and light mode
        </Text>
        
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: themeMode === 'dark' ? theme.primary : theme.surface,
                borderColor: themeMode === 'dark' ? theme.primary : theme.border,
              }
            ]}
            onPress={() => handleThemeChange('dark')}
            activeOpacity={0.7}
          >
            <FontAwesome 
              name="moon-o" 
              size={18} 
              color={themeMode === 'dark' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.optionText, 
              { color: themeMode === 'dark' ? '#FFFFFF' : theme.text }
            ]}>
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: themeMode === 'light' ? theme.primary : theme.surface,
                borderColor: themeMode === 'light' ? theme.primary : theme.border,
              }
            ]}
            onPress={() => handleThemeChange('light')}
            activeOpacity={0.7}
          >
            <FontAwesome 
              name="sun-o" 
              size={18} 
              color={themeMode === 'light' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.optionText, 
              { color: themeMode === 'light' ? '#FFFFFF' : theme.text }
            ]}>
              Light
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Icon Package Selection */}
      <View style={[styles.settingGroup, styles.settingGroupBorder, { borderTopColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Icons</Text>
        <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
          Choose your preferred icon style
        </Text>
        
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              styles.optionButtonSmall,
              {
                backgroundColor: iconPackage === 'simple' ? theme.primary : theme.surface,
                borderColor: iconPackage === 'simple' ? theme.primary : theme.border,
              }
            ]}
            onPress={() => handleIconPackageChange('simple')}
            activeOpacity={0.7}
          >
            <FontAwesome 
              name="circle-o" 
              size={16} 
              color={iconPackage === 'simple' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.optionTextSmall, 
              { color: iconPackage === 'simple' ? '#FFFFFF' : theme.text }
            ]}>
              Simple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              styles.optionButtonSmall,
              {
                backgroundColor: iconPackage === 'colorful' ? theme.primary : theme.surface,
                borderColor: iconPackage === 'colorful' ? theme.primary : theme.border,
              }
            ]}
            onPress={() => handleIconPackageChange('colorful')}
            activeOpacity={0.7}
          >
            <FontAwesome 
              name="star" 
              size={16} 
              color={iconPackage === 'colorful' ? '#FFFFFF' : '#F59E0B'} 
            />
            <Text style={[
              styles.optionTextSmall, 
              { color: iconPackage === 'colorful' ? '#FFFFFF' : theme.text }
            ]}>
              Colorful
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              styles.optionButtonSmall,
              {
                backgroundColor: iconPackage === 'none' ? theme.primary : theme.surface,
                borderColor: iconPackage === 'none' ? theme.primary : theme.border,
              }
            ]}
            onPress={() => handleIconPackageChange('none')}
            activeOpacity={0.7}
          >
            <FontAwesome 
              name="font" 
              size={16} 
              color={iconPackage === 'none' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.optionTextSmall, 
              { color: iconPackage === 'none' ? '#FFFFFF' : theme.text }
            ]}>
              None
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === 'web' ? 20 : 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  settingGroup: {
    marginBottom: 8,
  },
  settingGroupBorder: {
    paddingTop: 20,
    marginTop: 12,
    borderTopWidth: 1,
  },
  settingLabel: {
    fontSize: Platform.OS === 'web' ? 15 : 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionButtonSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextSmall: {
    fontSize: 13,
    fontWeight: '600',
  },
});
