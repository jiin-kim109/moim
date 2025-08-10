import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './ui/text';
import { Image } from './ui/image';
import { X, Flag, MapPin, User } from 'lucide-react-native';
import { ChatRoom } from '../hooks/types';

interface ChatRoomDetailProps {
  chatRoom: ChatRoom | null;
  visible: boolean;
  onClose: () => void;
  onJoin: (chatRoom: ChatRoom) => void;
  onReport: (chatRoom: ChatRoom) => void;
}

export default function ChatRoomDetail({ 
  chatRoom, 
  visible, 
  onClose, 
  onJoin, 
  onReport 
}: ChatRoomDetailProps) {
  if (!chatRoom) return null;

  const participantText = chatRoom.max_participants 
    ? `${chatRoom.participant_count}/${chatRoom.max_participants}`
    : `${chatRoom.participant_count}`;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionInTiming={0}
      backdropTransitionOutTiming={0}
    >
        <View 
          className="bg-white rounded-t-3xl overflow-hidden"
        >
          {/* Header with close button */}
          <View className="absolute top-4 right-4 z-10">
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-black/20 rounded-full items-center justify-center"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Thumbnail background section */}
          <View className="h-96 relative">
            <Image
              source={chatRoom.thumbnail_url ? { uri: chatRoom.thumbnail_url } : require('@assets/chatroom-thumbnail-default.png')}
              className="absolute inset-0 w-full h-full"
            />
            
            {/* Smooth gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              locations={[0, 0.6, 1]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            
            {/* Content over image */}
            <View className="p-6 pb-8 absolute bottom-0 left-0 right-0">
              <Text className="text-2xl font-bold text-white mb-1">
                {chatRoom.title}
              </Text>
              
              {/* Location */}
              {chatRoom.address && (
                <View className="flex-row items-center gap-2 mb-1">
                  <MapPin size={16} color="white" />
                  <Text className="text-white/90">
                    {chatRoom.address.place_name || chatRoom.address.city}
                  </Text>
                </View>
              )}

              {/* Participant count */}
              <View className="flex-row items-center gap-2 mb-3">
                <User size={16} color="white" />
                <Text className="text-white/90">
                  {participantText} participants
                </Text>
              </View>

              {/* Description */}
              {chatRoom.description && (
                <Text className="text-white/90 leading-5 text-lg mb-1">
                  {chatRoom.description}
                </Text>
              )}
            </View>
          </View>

          {/* Action buttons - fixed at bottom */}
          <View className="mt-auto flex-row">
            <TouchableOpacity
              onPress={() => onJoin(chatRoom)}
              className="flex-1 bg-blue-500 py-5 items-center justify-center"
            >
              <Text className="text-white font-bold text-2xl mb-7">
                Join Chat
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => onReport(chatRoom)}
              className="w-20 bg-gray-200 items-center justify-center"
            >
              <View className="mb-7">
                <Flag size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
    </Modal>
  );
} 