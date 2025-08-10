import React, { useState } from 'react';
import { FlatList, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from './ui/image';
import { Text } from './ui/text';
import { User, MapPin } from 'lucide-react-native';
import { ChatRoom } from '../hooks/types';
import ChatRoomDetail from './ChatRoomDetail';
import { useGetRecommendedChatrooms, RecommendedChatroomsPage } from '../hooks/chats/useGetRecommendedChatrooms';
import { useGetCurrentUserProfile } from '../hooks/useGetCurrentUserProfile';
import { useRouter } from 'expo-router';

interface OpenChatRoomFeedItemProps {
  chatRoom: ChatRoom;
  onPress?: (chatRoom: ChatRoom) => void;
}

function OpenChatRoomFeedItem({ chatRoom, onPress }: OpenChatRoomFeedItemProps) {
  const handlePress = () => {
    onPress?.(chatRoom);
  };

  const participantText = chatRoom.max_participants 
    ? `${chatRoom.participant_count}/${chatRoom.max_participants}`
    : `${chatRoom.participant_count}`;

  return (
    <TouchableOpacity onPress={handlePress} className="flex-row p-4 border-b border-gray-100">
      {/* Thumbnail */}
      <Image 
        source={chatRoom.thumbnail_url ? { uri: chatRoom.thumbnail_url } : require('@assets/chatroom-thumbnail-default.png')}
        className="w-20 h-20 py-6 px-4 rounded-3xl ml-2 mr-6 flex-shrink-0"
        contentFit='cover'
      />
      
      <View className="flex-1 gap-1">
        {/* Chat room name */}
        <Text className="text-lg font-medium text-gray-900">
          {chatRoom.title}
        </Text>
        
        {/* Location */}
        {chatRoom.address && (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#6B7280" />
            <Text className="text-sm text-gray-500">
              {chatRoom.address.place_name || chatRoom.address.city}
            </Text>
          </View>
        )}
        
        {/* Participant count with icon */}
        <View className="flex-row items-center gap-1">
          <User size={12} color="#6B7280" fill="#6B7280" />
          <Text className="text-sm text-gray-500">
            {participantText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface OpenChatRoomFeedProps {
  onChatRoomPress?: (chatRoom: ChatRoom) => void;
  onChatRoomJoin?: (chatRoom: ChatRoom) => void;
}

export default function OpenChatRoomFeed({ onChatRoomPress, onChatRoomJoin }: OpenChatRoomFeedProps) {
  const router = useRouter();
  const { data: userProfile } = useGetCurrentUserProfile();
  const currentUserId = userProfile?.id;
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch 
  } = useGetRecommendedChatrooms(
    currentUserId || '',
    {
      enabled: !!currentUserId,
      retry: true,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000),
    }
  );

  // Flatten the paginated data
  const chatRooms = data?.pages.flatMap((page) => (page as RecommendedChatroomsPage).chatrooms) || [];

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    setSelectedChatRoom(chatRoom);
    setDetailVisible(true);
    onChatRoomPress?.(chatRoom);
  };

  const handleJoinRoom = (chatRoom: ChatRoom) => {
    onChatRoomJoin?.(chatRoom);
    setDetailVisible(false);
  };

  const handleReportRoom = (chatRoom: ChatRoom) => {
    setDetailVisible(false);
    router.push({
      pathname: '/report',
      params: {
        type: 'chatroom',
        chatroom_id: chatRoom.id,
        payload: JSON.stringify({
          chatroom_id: chatRoom.id,
          title: chatRoom.title,
        }),
      },
    });
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedChatRoom(null);
  };

  const renderChatRoomItem = ({ item }: { item: ChatRoom }) => (
    <OpenChatRoomFeedItem chatRoom={item} onPress={handleChatRoomPress} />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-lg text-gray-500 text-center">
        No chat rooms available
      </Text>
      <Text className="text-sm text-gray-400 text-center mt-2">
        Check back later or create your own!
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" className="mb-4" />
      <Text className="text-gray-500">Loading chat rooms...</Text>
    </View>
  );

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading && chatRooms.length === 0) {
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
        refreshing={isLoading && chatRooms.length === 0}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
      />
      
      <ChatRoomDetail
        chatRoom={selectedChatRoom}
        visible={detailVisible}
        onClose={handleCloseDetail}
        onJoin={handleJoinRoom}
        onReport={handleReportRoom}
      />
    </View>
  );
} 