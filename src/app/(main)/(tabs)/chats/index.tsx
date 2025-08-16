import React from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Bell } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import JoinedChatRoomList from '@components/JoinedChatRoomList';
import { useDebouncedFunction } from '@lib/utils';



export default function ChatsScreen() {
  const router = useRouter();

  const handleChatRoomPress = useDebouncedFunction(chatroomItem => {
    router.push(`/chatroom/${chatroomItem.chatroom.id}`);
  });

  const handleProfilePress = useDebouncedFunction(() => {
    router.push('/chats/profile');
  });

  const handleNotificationPress = useDebouncedFunction(() => {
    // TODO: Implement notification functionality
    console.log('Notification pressed');
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-5 pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-semibold text-gray-900">Chats</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={handleNotificationPress} className="p-2">
              <Bell size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePress} className="p-2">
              <User size={32} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Chat List */}
      <JoinedChatRoomList 
        onChatRoomPress={handleChatRoomPress}
      />
    </SafeAreaView>
  );
} 