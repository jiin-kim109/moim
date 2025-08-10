import React from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCirclePlus } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import OpenChatRoomFeed from '@components/OpenChatRoomFeed';
import { ChatRoom } from '@hooks/types';
import { useDebouncedFunction } from '@lib/utils';

export default function HomeScreen() {
  const router = useRouter();

  const handleChatRoomJoin = useDebouncedFunction((chatRoom: ChatRoom) => {
    if (chatRoom.max_participants && chatRoom.participant_count >= chatRoom.max_participants) {
      Alert.alert(
        'Chatroom Full',
        `This chatroom has reached its maximum capacity of ${chatRoom.max_participants} participants. Please join another chatroom.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setTimeout(() => {
      router.push(`/chatroom/${chatRoom.id}`);
    }, 300); // give delay for smooth animation effect
  });

  const handleCreateChatRoom = useDebouncedFunction(() => {
    router.push('/chatroom/create');
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-primary">Moim</Text>
          <Button
            variant="ghost"
            size="icon"
            onPress={handleCreateChatRoom}
            className="h-12 w-12"
          >
            <MessageCirclePlus size={32} className='text-primary' />
          </Button>
        </View>
      </View>
      
      {/* Description above chatroom list */}
      <View className="px-4 pb-4">
        <Text className="text-2xl font-semibold text-gray-700">
          Browse Chats
        </Text>
        <Text className="text-md text-gray-500 mt-1">
          Discover and join virtual chatrooms in your area
        </Text>
      </View>
      
      <OpenChatRoomFeed onChatRoomJoin={handleChatRoomJoin} />
    </SafeAreaView>
  );
} 