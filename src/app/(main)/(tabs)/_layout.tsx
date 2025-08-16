import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Compass, MessageCircle } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 100,
        },
        tabBarItemStyle: {
          backgroundColor: 'transparent',
          borderRadius: 16,
          marginHorizontal: 8,
          paddingTop: 10,
          flex: 1,
        },
        tabBarActiveTintColor: '#f97316', // orange-500 (primary)
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
          marginTop: 8,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              borderWidth: focused ? 2 : 1,
              borderColor: focused ? '#f97316' : '#d1d5db', // orange-500 when focused
              borderRadius: 12,
              padding: 8,
              backgroundColor: focused ? '#fed7aa' : 'transparent', // orange-200 when focused
            }}>
              <Compass size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              borderWidth: focused ? 2 : 1,
              borderColor: focused ? '#f97316' : '#d1d5db', // orange-500 when focused
              borderRadius: 12,
              padding: 8,
              backgroundColor: focused ? '#fed7aa' : 'transparent', // orange-200 when focused
            }}>
              <MessageCircle size={20} color={color} />
            </View>
          ),
        }}
      />

    </Tabs>
  );
} 