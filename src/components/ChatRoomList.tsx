import React, { useState } from 'react';
import { FlatList, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from './ui/text';
import { User, MapPin } from 'lucide-react-native';
import { useGetPublicChatrooms } from '../hooks/useGetPublicChatrooms';
import { ChatRoom } from '../hooks/types';
import ChatRoomDetail from './ChatRoomDetail';

interface ChatRoomListItemProps {
  chatRoom: ChatRoom;
  onPress?: (chatRoom: ChatRoom) => void;
}

function ChatRoomListItem({ chatRoom, onPress }: ChatRoomListItemProps) {
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
        source={chatRoom.thumbnail_url ? { uri: chatRoom.thumbnail_url } : require('@assets/chatroom-default.png')}
        className="w-24 h-24 pt-1 pl-1 pr-4 pb-5 rounded-3xl ml-1 mr-2 flex-shrink-0"
        resizeMode="cover"
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

interface ChatRoomListProps {
  onChatRoomPress?: (chatRoom: ChatRoom) => void;
  onChatRoomJoin?: (chatRoom: ChatRoom) => void;
}

export default function ChatRoomList({ onChatRoomPress, onChatRoomJoin }: ChatRoomListProps) {
  const { data: chatRooms, isLoading, error, refetch } = useGetPublicChatrooms();
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

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
    // TODO: Implement report room logic
    console.log('Reporting room:', chatRoom.title);
    setDetailVisible(false);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedChatRoom(null);
  };

  const renderChatRoomItem = ({ item }: { item: ChatRoom }) => (
    <ChatRoomListItem chatRoom={item} onPress={handleChatRoomPress} />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-lg text-gray-500 text-center">
        No chat rooms available
      </Text>
      <Text className="text-sm text-gray-400 text-center mt-2">
        Check back later for new rooms to join
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" className="mb-4" />
      <Text className="text-gray-500">Loading chat rooms...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-lg text-red-500 text-center mb-4">
        Failed to load chat rooms
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
        {error?.message || 'Something went wrong'}
      </Text>
      <TouchableOpacity
        onPress={() => refetch()}
        className="bg-blue-500 px-4 py-2 rounded-md"
      >
        <Text className="text-white font-medium">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
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