import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/text';
import ChatRoomList from '@components/ChatRoomList';
import { ChatRoom } from '@hooks/types';

export default function MainScreen() {
  const router = useRouter();

  const handleChatRoomJoin = (chatRoom: ChatRoom) => {
    setTimeout(() => {
      router.push(`/chatroom/${chatRoom.id}`);
    }, 300); // give delay for smooth animation effect
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-2xl font-semibold text-gray-900">Open Chats</Text>
      </View>
      
      <ChatRoomList onChatRoomJoin={handleChatRoomJoin} />
    </SafeAreaView>
  );
} 