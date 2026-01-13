import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const navItems = [
  { name: 'Inbox', route: '/(tabs)/inbox', icon: 'inbox' },
  { name: 'Today', route: '/(tabs)/today', icon: 'calendar' },
  { name: 'Upcoming', route: '/(tabs)/upcoming', icon: 'calendar-check-o' },
  { name: 'Projects', route: '/(tabs)/projects', icon: 'folder' },
  { name: 'Labels', route: '/(tabs)/labels', icon: 'tags' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>BarkItDone</Text>
      {navItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.navItem, isActive && styles.activeNavItem]}
            onPress={() => router.push(item.route as any)}
          >
            <FontAwesome name={item.icon as any} size={20} color={isActive ? '#3B82F6' : '#6B7280'} />
            <Text style={[styles.navText, isActive && styles.activeNavText]}>{item.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1F2937',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeNavItem: {
    backgroundColor: '#EFF6FF',
  },
  navText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  activeNavText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
