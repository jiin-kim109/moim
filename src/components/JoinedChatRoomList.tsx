import React from 'react';
import { FlatList, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from './ui/image';
import { Text } from './ui/text';
import { Badge } from './ui/badge';
import { ChatRoom } from '../hooks/types';
import { formatTimeForChatRoomList } from '../lib/utils';
import { useGetJoinedChatrooms } from '../hooks/chats/useGetJoinedChatrooms';
import { useGetUnreadChatroomMessageCount } from '../hooks/message/useGetUnreadChatroomMessageCount';
import { useGetChatMessages, useGetMultipleChatroomMessages } from '../hooks/message/useGetChatMessages';

interface JoinedChatroomItem {
  chatroom: ChatRoom;
  lastMessage: string;
  unread_count: number;
}

interface JoinedChatRoomListItemProps {
  chatRoom: ChatRoom;
  userId: string;
  onPress?: (chatRoom: JoinedChatroomItem) => void;
}

function JoinedChatRoomListItem({ chatRoom, userId, onPress }: JoinedChatRoomListItemProps) {
  const { data: messagesData } = useGetChatMessages(chatRoom.id, {
    enabled: !!chatRoom.id,
  });
  
  const { data: unreadCount = 0 } = useGetUnreadChatroomMessageCount(chatRoom.id, userId, {
    enabled: !!chatRoom.id,
  });

  const latestMessage = (messagesData as any)?.pages?.[0]?.messages?.[0];

  const chatroomItem: JoinedChatroomItem = {
    chatroom: chatRoom,
    lastMessage: latestMessage?.message || '',
    unread_count: unreadCount,
  };

  const handlePress = () => {
    onPress?.(chatroomItem);
  };
  return (
    <TouchableOpacity onPress={handlePress} className="flex-row p-5 bg-white">
      {/* Thumbnail */}
      <Image 
        source={chatroomItem.chatroom.thumbnail_url ? { uri: chatroomItem.chatroom.thumbnail_url } : require('@assets/chatroom-thumbnail-default.png')}
        className="w-20 h-20 rounded-3xl mr-4 flex-shrink-0"
        contentFit='cover'
      />
      
      {/* Content */}
      <View className="flex-1 justify-center">
        {/* Top row: Chat room name, participant count, and timestamp */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1">
            <Text className="text-lg font-medium text-gray-900" numberOfLines={1}>
              {chatroomItem.chatroom.title.length > 25 ? `${chatroomItem.chatroom.title.substring(0, 25)}...` : chatroomItem.chatroom.title}
            </Text>
            <Text className="text-base text-gray-500 ml-3">
              {chatroomItem.chatroom.participant_count}
            </Text>
          </View>
          {/* Timestamp */}
          {latestMessage?.created_at && (
            <Text className="text-md text-gray-400 ml-2">
              {formatTimeForChatRoomList(latestMessage.created_at)}
            </Text>
          )}
        </View>
        
        {/* Bottom row: Latest message and unread count */}
        <View className="flex-row items-center justify-between">
          <Text className="text-md text-gray-500 flex-1 mr-2" numberOfLines={1}>
            {chatroomItem.lastMessage || 'No messages yet'}
          </Text>
          {/* Unread count badge */}
          {chatroomItem.unread_count > 0 && (
            <Badge 
              variant="destructive" 
              className="bg-red-500 min-w-5 h-5 rounded-full px-1.5 py-0"
            >
              <Text className="text-xs text-white font-medium">
                {chatroomItem.unread_count > 99 ? '99+' : chatroomItem.unread_count}
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
  onChatRoomPress?: (chatRoom: JoinedChatroomItem) => void;
}

export default function JoinedChatRoomList({ userId, onChatRoomPress }: JoinedChatRoomListProps) {
  const { data: joinedChatrooms, isLoading, refetch } = useGetJoinedChatrooms(userId);
  

  const chatroomIds = React.useMemo(() => 
    joinedChatrooms?.map(room => room.id) || [], 
    [joinedChatrooms]
  );
  
  const messageQueries = useGetMultipleChatroomMessages(chatroomIds);
  
  // Sort chatrooms by latest message timestamp
  const sortedChatrooms = React.useMemo(() => {
    if (!joinedChatrooms) return [];
    
    return [...joinedChatrooms].sort((a, b) => {
      const [messagesA, messagesB] = [a, b].map(room => {
        const idx = joinedChatrooms.findIndex(r => r.id === room.id);
        return (messageQueries[idx]?.data as any)?.pages?.[0]?.messages?.[0]?.created_at;
      });
      
      if (!messagesA && !messagesB) return 0;
      if (!messagesA) return 1;
      if (!messagesB) return -1;
      
      return new Date(messagesB).getTime() - new Date(messagesA).getTime();
    });
  }, [joinedChatrooms, messageQueries]);

  const handleChatRoomPress = (chatRoom: JoinedChatroomItem) => {
    onChatRoomPress?.(chatRoom);
  };

  const renderChatRoomItem = ({ item }: { item: ChatRoom }) => (
    <JoinedChatRoomListItem chatRoom={item} userId={userId} onPress={handleChatRoomPress} />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-lg text-gray-500 text-center">
        No chat rooms joined yet
      </Text>
      <Text className="text-sm text-gray-400 text-center mt-2">
        Join chat rooms to start conversations
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" className="mb-4" />
      <Text className="text-gray-500">Loading your chats...</Text>
    </View>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={sortedChatrooms}
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