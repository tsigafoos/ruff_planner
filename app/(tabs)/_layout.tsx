import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import Colors from '@/constants/Colors';
import WebLayout from '@/components/layout/WebLayout';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  const tabs = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: isWeb
          ? { display: 'none' } // Hide tab bar on web
          : {
              backgroundColor: colorScheme === 'dark' ? '#16161a' : '#ffffff',
              borderTopColor: colorScheme === 'dark' ? '#2a2a32' : '#e2e2e7',
            },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <TabBarIcon name="folder" color={color} />,
        }}
      />
      {/* Hidden tabs - kept for routing but not shown in tab bar */}
      <Tabs.Screen
        name="tasks"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="labels"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );

  // Wrap with WebLayout on web
  if (isWeb) {
    return <WebLayout>{tabs}</WebLayout>;
  }

  return tabs;
}
