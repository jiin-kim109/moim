import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/text';
import JoinedChatRoomList from '@components/JoinedChatRoomList';
import { useDebouncedFunction } from '@lib/utils';


export default function ChatsScreen() {
  const router = useRouter();

  const handleChatRoomPress = useDebouncedFunction(chatroomItem => {
    router.push(`/chatroom/${chatroomItem.chatroom.id}`);
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-5 pb-2">
        <Text className="text-2xl font-semibold text-gray-900">Chats</Text>
      </View>
      
      {/* Chat List */}
      <JoinedChatRoomList 
        onChatRoomPress={handleChatRoomPress}
      />
    </SafeAreaView>
  );
} 