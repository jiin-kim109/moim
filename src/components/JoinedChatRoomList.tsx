import React from 'react';
import { FlatList, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from './ui/text';
import { Badge } from './ui/badge';
import { useGetJoinedChatrooms, useJoinedChatroomsSubscription } from '../hooks/useGetJoinedChatrooms';
import { JoinedChatRoom } from '../hooks/types';

interface JoinedChatRoomListItemProps {
  chatRoom: JoinedChatRoom;
  onPress?: (chatRoom: JoinedChatRoom) => void;
}

function JoinedChatRoomListItem({ chatRoom, onPress }: JoinedChatRoomListItemProps) {
  const handlePress = () => {
    onPress?.(chatRoom);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (daysDiff === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (daysDiff < 7) {
      // This week - show day name
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      // More than a week - show date
      return date.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric' 
      });
    }
  };

  const participantText = `${chatRoom.participant_count || 0}`;

  return (
    <TouchableOpacity onPress={handlePress} className="flex-row p-6 bg-white">
      {/* Thumbnail */}
      <Image 
        source={chatRoom.thumbnail_url ? { uri: chatRoom.thumbnail_url } : require('@assets/chatroom-default.png')}
        className="w-16 h-16 rounded-3xl mr-4 flex-shrink-0"
        resizeMode="cover"
      />
      
      {/* Content */}
      <View className="flex-1 justify-center">
        {/* Top row: Chat room name, participant count, and timestamp */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1">
            <Text className="text-lg font-medium text-gray-900" numberOfLines={1}>
              {chatRoom.title}
            </Text>
            <Text className="text-base text-gray-500 ml-3">
              {participantText}
            </Text>
          </View>
          {/* Timestamp */}
          {chatRoom.latest_message && (
            <Text className="text-md text-gray-400 ml-2">
              {formatTime(chatRoom.latest_message.created_at)}
            </Text>
          )}
        </View>
        
        {/* Bottom row: Latest message and unread count */}
        <View className="flex-row items-center justify-between">
          <Text className="text-md text-gray-500 flex-1 mr-2" numberOfLines={1}>
            {chatRoom.latest_message?.message || 'No messages yet'}
          </Text>
          {/* Unread count badge */}
          {chatRoom.unread_count > 0 && (
            <Badge 
              variant="destructive" 
              className="bg-red-500 min-w-5 h-5 rounded-full px-1.5 py-0"
            >
              <Text className="text-xs text-white font-medium">
                {chatRoom.unread_count > 99 ? '99+' : chatRoom.unread_count}
              </Text>
            </Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface JoinedChatRoomListProps {
  userId: string;
  onChatRoomPress?: (chatRoom: JoinedChatRoom) => void;
}

export default function JoinedChatRoomList({ userId, onChatRoomPress }: JoinedChatRoomListProps) {
  const { data: chatRooms, isLoading, error, refetch } = useGetJoinedChatrooms(userId, {
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
  });
  useJoinedChatroomsSubscription(userId);

  const handleChatRoomPress = (chatRoom: JoinedChatRoom) => {
    onChatRoomPress?.(chatRoom);
  };

  const renderChatRoomItem = ({ item }: { item: JoinedChatRoom }) => (
    <JoinedChatRoomListItem chatRoom={item} onPress={handleChatRoomPress} />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-lg text-gray-500 text-center">
        No chat rooms joined yet
      </Text>
      <Text className="text-sm text-gray-400 text-center mt-2">
        Join some chat rooms to start conversations
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" className="mb-4" />
      <Text className="text-gray-500">Loading your chats...</Text>
    </View>
  );

  if (isLoading || error) {
    return renderLoadingState();
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoomItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
  );
} 