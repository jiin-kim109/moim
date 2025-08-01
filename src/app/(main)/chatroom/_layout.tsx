import { Stack } from 'expo-router';

export default function ChatroomLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="[chatroom_id]"
      />
      <Stack.Screen 
        name="create" 
      />
    </Stack>
  );
} 