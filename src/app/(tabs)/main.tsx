import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCirclePlus } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import OpenChatRoomList from '@components/OpenChatRoomList';
import { ChatRoom } from '@hooks/types';

export default function MainScreen() {
  const router = useRouter();

  const handleChatRoomJoin = (chatRoom: ChatRoom) => {
    setTimeout(() => {
      router.push(`/chatroom/${chatRoom.id}`);
    }, 300); // give delay for smooth animation effect
  };

  const handleCreateChatRoom = () => {
    router.push('/chatroom/create');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-gray-900">Open Chats</Text>
          <Button
            variant="ghost"
            size="icon"
            onPress={handleCreateChatRoom}
            className="h-12 w-12 mr-1"
          >
            <MessageCirclePlus size={32} className='text-primary' />
          </Button>
        </View>
        <Text className="text-base text-gray-500 mt-1 opacity-80">
          Discover and join virtual chatrooms in your area
        </Text>
      </View>
      
      <OpenChatRoomList onChatRoomJoin={handleChatRoomJoin} />
    </SafeAreaView>
  );
} 