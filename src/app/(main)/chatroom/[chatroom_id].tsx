import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send, MapPin, Users, Edit, Trash2 } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import ChatMessage from '@components/ChatMessage';
import JoinChatroomForm from '@components/JoinChatroomForm';
import ChatroomSideMenu from '@components/ChatroomSideMenu';
import { useGetChatroom } from '@hooks/chats/useGetChatroom';
import { useGetChatMessages } from '@hooks/chats/useGetChatMessages';
import { useGetChatroomParticipants } from '@hooks/chats/useGetChatroomParticipants';
import { useSendChatMessage } from '@hooks/message/useSendChatMessage';
import { useSaveLastReadMessage, useGetLastReadMessage } from '@hooks/message/useLastReadMessage';
import { ChatMessage as ChatMessageType } from '@hooks/types';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';

export default function ChatroomScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessageType | null>(null);
  
  // Bottom sheet ref and snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const { data: userProfile, isLoading: userProfileLoading } = useGetCurrentUserProfile();
  const currentUserId = userProfile?.id;
  
  const { data: chatroom } = useGetChatroom(chatroom_id as string);
  const { data: participants, isLoading: participantsLoading } = useGetChatroomParticipants(chatroom_id as string);
  const { data: messagesData } = useGetChatMessages(chatroom_id as string);
  const { data: lastReadMessage } = useGetLastReadMessage(chatroom_id as string);
  const sendMessageMutation = useSendChatMessage();
  const saveLastReadMessageMutation = useSaveLastReadMessage();

  const isParticipant = participants?.find(
    (participant) => participant.user_id === currentUserId
  );

  // Handle long press on chat message
  const handleMessageLongPress = useCallback((message: ChatMessageType) => {
    setSelectedMessage(message);
    bottomSheetRef.current?.expand();
  }, []);

  // Handle delete message
  const handleDeleteMessage = useCallback(() => {
    if (selectedMessage) {
      console.log('Delete message:', selectedMessage.id);
      // TODO: Implement delete message functionality
      bottomSheetRef.current?.close();
      setSelectedMessage(null);
    }
  }, [selectedMessage]);

  // Handle edit message
  const handleEditMessage = useCallback(() => {
    if (selectedMessage) {
      console.log('Edit message:', selectedMessage.id);
      // TODO: Implement edit message functionality
      bottomSheetRef.current?.close();
      setSelectedMessage(null);
    }
  }, [selectedMessage]);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedMessage(null);
  }, []);

  // Store last read message when entering chatroom or when new messages arrive
  useEffect(() => {
    if (!chatroom_id || !isParticipant || !messagesData?.pages?.[0]) {
      return;
    }

    const messages = (messagesData.pages[0] as any)?.messages;
    if (messages && messages.length > 0) {
      const latestMessage = messages[0];
      
      if (!lastReadMessage || lastReadMessage.id !== latestMessage.id) {
        saveLastReadMessageMutation.mutate({
          chatroomId: chatroom_id as string,
          message: latestMessage,
        });
      }
    }
  }, [chatroom_id, isParticipant, messagesData, lastReadMessage, saveLastReadMessageMutation]);

  const handleSend = async () => {
    if (!message.trim() || !currentUserId) return;

    try {
      // Send message to database
      await sendMessageMutation.mutateAsync({
        chatroom_id: chatroom_id as string,
        message: message.trim(),
        sender_id: currentUserId,
      });

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderChatContent = () => {
    if (userProfileLoading || participantsLoading) {
      return null;
    }
    
    if (!isParticipant) {
      return (
        <JoinChatroomForm
          chatroomId={chatroom_id as string}
          userId={currentUserId as string}
        />
      );
    }

    const messages = (messagesData?.pages?.[0] as any)?.messages || [];

    return (
      <FlatList
        data={messages}
        keyExtractor={(item: ChatMessageType) => item.id}
        renderItem={({ item }: { item: ChatMessageType }) => (
          <ChatMessage 
            message={item} 
            isCurrentUser={item.sender_id === currentUserId}
            onLongPress={handleMessageLongPress}
          />
        )}
        contentContainerStyle={{ 
          padding: 16,
          flexGrow: 1,
          justifyContent: 'flex-end'
        }}
        inverted
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-end p-4">
            <Text className="text-center text-gray-500 mb-4">
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <GestureHandlerRootView className="flex-1 bg-orange-50">
      <TouchableOpacity onPress={handleCloseBottomSheet} activeOpacity={1} className="flex-1 mt-16">
        {/* Header */}
        <View className="flex-row items-center px-4 py-2 bg-orange-50">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>

          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <Text className="text-xl font-semibold text-gray-900">
                {chatroom?.title}
              </Text>
              <Text className="text-lg text-gray-500">
                {chatroom?.participant_count || 0}
              </Text>
            </View>

            {/* Location */}
            {chatroom?.address && (
              <View className="flex-row items-center gap-1 mb-1">
                <MapPin size={12} color="#6B7280" />
                <Text className="text-base text-gray-500">
                  {chatroom.address.place_name || chatroom.address.city}
                </Text>
              </View>
            )}
          </View>
          
          {/* Participants Button */}
          <TouchableOpacity
            onPress={() => setIsSideMenuVisible(true)}
            className="p-2 -mr-2"
          >
            <Users size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Chat Messages Area */}
        <View className="flex-1 bg-orange-50">
          {renderChatContent()}
        </View>
      </TouchableOpacity>
      
      {/* Message Input Area */}
      <View className="px-4 pb-12 py-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center px-2 gap-3">
          <View className="flex-1">
            <Input
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              multiline
              editable={!!isParticipant}
              className="bg-gray-100 border-0 rounded-2xl px-4 py-3 min-h-12 max-h-32 text-base"
              style={{
                textAlignVertical: 'center',
              }}
            />
          </View>
          
          <Button
            onPress={handleSend}
            disabled={!isParticipant || !message.trim()}
            size="icon"
            className={`w-12 h-12 rounded-full ${
              message.trim() ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            <Send 
              size={20} 
              color="white" 
              style={{ marginLeft: 2 }} // Slight offset to center the icon
            />
          </Button>
        </View>
      </View>

      {/* Side Menu */}
      <ChatroomSideMenu
        isVisible={isSideMenuVisible}
        onClose={() => setIsSideMenuVisible(false)}
        chatroomId={chatroom_id as string}
        hostId={chatroom?.host_id || ''}
        onKickParticipant={(userId) => {
          // TODO: Implement kick functionality
          console.log('Kick participant:', userId);
        }}
        onBanParticipant={(userId) => {
          // TODO: Implement ban functionality
          console.log('Ban participant:', userId);
        }}
        onChangeNickname={(userId) => {
          // TODO: Implement nickname change functionality
          console.log('Change nickname for:', userId);
        }}
      />

      {/* Bottom Sheet for Message Options */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: 'white' }}
      >
        <BottomSheetView className="flex-1 px-4 pt-1 pb-16">
          <View className="flex-1">
            {/* Header */}
            <View className="mb-12">
              {selectedMessage && (
                <View className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <Text className="text-gray-800 text-sm font-medium mb-1">
                    From: {selectedMessage.sender_nickname}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    "{selectedMessage.message.substring(0, 50)}{selectedMessage.message.length > 50 ? '...' : ''}"
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="gap-4">
              {/* Edit Message Button */}
              {selectedMessage && selectedMessage.sender_id === currentUserId && (
                <Button
                  onPress={handleEditMessage}
                  variant="outline"
                  className="w-full"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Edit size={18} color="#374151" />
                    <Text className="text-gray-700 font-medium">Edit Message</Text>
                  </View>
                </Button>
              )}

              {/* Delete Message Button */}
              <Button
                onPress={handleDeleteMessage}
                variant="destructive"
                className="w-full"
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Trash2 size={18} color="white" />
                  <Text className="text-white font-medium">Delete Message</Text>
                </View>
              </Button>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
} 