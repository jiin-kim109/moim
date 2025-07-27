import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send, MapPin } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import ChatMessage from '@components/ChatMessage';
import JoinChatroomForm from '@components/JoinChatroomForm';
import { useGetChatroom } from '@hooks/useGetChatroom';
import { useGetChatMessages } from '@hooks/useGetChatMessages';
import { useSendChatMessage } from '@hooks/useSendChatMessage';
import { useChatMessageSubscription } from '@hooks/useChatMessageSubscription';
import { ChatMessage as ChatMessageType } from '@hooks/types';
import supabase from '@lib/supabase';
import localStorage from '@lib/localstorage';

export default function ChatroomScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { chatroom_id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const { data: chatroom } = useGetChatroom(chatroom_id as string);
  const { data: messagesData, isLoading: messagesLoading } = useGetChatMessages(chatroom_id as string);
  const sendMessageMutation = useSendChatMessage();
  
  // Set up realtime subscription for chat messages
  const { broadcastMessageCreatedEvent } = useChatMessageSubscription(chatroom_id as string);

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const currentUserParticipant = chatroom?.participants?.find(
    participant => participant.user_id === currentUserId
  );

  const isParticipant = !!currentUserParticipant;

  // Store last read message ID when entering chatroom or when new messages arrive
  useEffect(() => {
    const storeLastReadMessage = async () => {
      if (!chatroom_id || !isParticipant || !messagesData?.pages?.[0]) {
        return;
      }

      const messages = (messagesData.pages[0] as any)?.messages;
      if (messages && messages.length > 0) {
        const latestMessage = messages[0];
        await localStorage.setLastReadMessage(chatroom_id as string, latestMessage);
      }
    };

    storeLastReadMessage();
  }, [chatroom_id, isParticipant, messagesData]);

  const handleSend = async () => {
    if (!message.trim() || !currentUserId) return;

    try {
      // Send message to database
      const newMessage = await sendMessageMutation.mutateAsync({
        chatroom_id: chatroom_id as string,
        message: message.trim(),
        sender_id: currentUserId,
      });

      await broadcastMessageCreatedEvent(newMessage)

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <View className="flex-1 bg-orange-50">
      <SafeAreaView className="flex-1 bg-orange-50">
        {/* Header */}
        <View className="flex-row items-center px-4 py-1 bg-orange-50">
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
            <View className="flex-row items-center gap-1 my-1">
              <MapPin size={12} color="#6B7280" />
              <Text className="text-base text-gray-500">
                {chatroom.address.place_name || chatroom.address.city}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chat Messages Area */}
      <View className="flex-1 bg-orange-50">
        {!isParticipant ? (
          // Show join interface if user is not a participant
          currentUserId ? (
            <JoinChatroomForm
              chatroomId={chatroom_id as string}
              userId={currentUserId}
            />
          ) : null
        ) : !messagesLoading && (messagesData?.pages?.[0] as any)?.messages?.length > 0 ? (
          <FlatList
            data={(messagesData.pages[0] as any).messages}
            keyExtractor={(item: ChatMessageType) => item.id}
            renderItem={({ item }: { item: ChatMessageType }) => (
              <ChatMessage 
                message={item} 
                isCurrentUser={item.sender_id === currentUserId}
              />
            )}
            contentContainerStyle={{ 
              padding: 16,
              flexGrow: 1,
              justifyContent: 'flex-end'
            }}
            inverted
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-end p-4">
            <Text className="text-center text-gray-500 mb-4">No messages yet. Start the conversation!</Text>
          </View>
        )}
      </View>
      </SafeAreaView>
      
      {/* Message Input Area */}
      <View className="px-4 pb-12 py-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center px-2 gap-3">
          <View className="flex-1">
            <Input
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              multiline
              editable={isParticipant}
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
    </View>
  );
} 