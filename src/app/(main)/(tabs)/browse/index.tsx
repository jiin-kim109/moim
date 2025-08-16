import React from 'react';
import { SafeAreaView, View, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCirclePlus, MapPin } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import OpenChatRoomFeed from '@components/OpenChatRoomFeed';
import { ChatRoom } from '@hooks/types';
import { useDebouncedFunction } from '@lib/utils';
import Logo from '@lib/icons/Logo';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';

export default function HomeScreen() {
  const router = useRouter();
  const { data: userProfile } = useGetCurrentUserProfile();

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

  const handleLocationPress = useDebouncedFunction(() => {
    router.push('/browse/update_location');
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-5">
        <View className="flex-row items-center justify-between">
          <Logo size="lg" />
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
      <View className="px-5 pb-4">
        <Text className="text-xl font-semibold text-gray-700 opacity-80">
          Browse Chats
        </Text>
        <Text className="text-md text-gray-500 mt-1">
          Discover and join virtual chatrooms in your area
        </Text>
        
        {/* Location Display */}
        <View className="flex-row items-center mt-4">
          <Text className="text-base font-medium text-gray-600 mr-1">
            Your location
          </Text>
          <MapPin size={18} color="#f97316" />
          <TouchableOpacity
            onPress={handleLocationPress}
            className="flex-row items-center self-start"
          >
            <Text className="text-xl underline text-gray-900 ml-1">
              {userProfile?.address?.place_name}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <OpenChatRoomFeed onChatRoomJoin={handleChatRoomJoin} />
    </SafeAreaView>
  );
} 