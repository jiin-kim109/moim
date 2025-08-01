import React, { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/text';
import JoinedChatRoomList from '@components/JoinedChatRoomList';
import { ChatRoom } from '@hooks/types';

interface JoinedChatroomItem {
  chatroom: ChatRoom;
  lastMessage: string;
  unread_count: number;
}

import supabase from '@lib/supabase';

export default function ChatsScreen() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleChatRoomPress = (chatRoomItem: JoinedChatroomItem) => {
    router.push(`/chatroom/${chatRoomItem.chatroom.id}`);
  };

  if (!currentUserId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-lg text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-5 pb-2">
        <Text className="text-2xl font-semibold text-gray-900">Chats</Text>
      </View>
      
      {/* Chat List */}
      <JoinedChatRoomList 
        userId={currentUserId}
        onChatRoomPress={handleChatRoomPress}
      />
    </SafeAreaView>
  );
} 