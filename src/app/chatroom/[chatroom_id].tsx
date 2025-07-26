import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import ChatMessage from '@components/ChatMessage';
import { invalidateChatroomQuery, useGetChatroom } from '@hooks/useGetChatroom';
import { useGetChatMessages, invalidateGetChatMessages } from '@hooks/useGetChatMessages';
import { useSendChatMessage } from '@hooks/useSendChatMessage';
import { useGetUserProfile } from '@hooks/useGetUserProfile';
import { useJoinChatroom } from '@hooks/useJoinChatroom';
import { useChatMessageSubscription } from '@hooks/useChatMessageSubscription';
import { ChatMessage as ChatMessageType } from '@hooks/types';
import supabase from '@lib/supabase';

export default function ChatroomScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [chatroomJoinError, setJoinError] = useState<string>('');
  const [currentAuthId, setCurrentAuthId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: chatroom } = useGetChatroom(chatroom_id as string);
  const { data: messagesData, isLoading: messagesLoading } = useGetChatMessages(chatroom_id as string);
  const sendMessageMutation = useSendChatMessage();
  const joinChatroomMutation = useJoinChatroom();
  
  // Set up realtime subscription for chat messages
  const { channelRef, broadcastMessageCreatedEvent } = useChatMessageSubscription(chatroom_id as string);

  // Get current user's auth ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentAuthId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: currentUserProfile } = useGetUserProfile(currentAuthId || '', {
    enabled: !!currentAuthId,
  });

  const currentUserParticipant = chatroom?.participants?.find(
    participant => participant.user_id === currentUserProfile?.id
  );

  const isParticipant = !!currentUserParticipant;

  const handleJoinChatroom = async () => {
    if (!nickname.trim() || !currentAuthId) return;

    setJoinError('');

    try {
      await joinChatroomMutation.mutateAsync({
        chatroom_id: chatroom_id as string,
        auth_id: currentAuthId,
        nickname: nickname.trim(),
      });

      invalidateChatroomQuery(queryClient, chatroom_id as string);
      invalidateGetChatMessages(queryClient, chatroom_id as string);
      
      setNickname('');
    } catch (error: any) {
      if (error.isDuplicateNickname) {
        setJoinError('This nickname is already taken in this chatroom. Please choose another.');
        return;
      }
      console.error('Failed to join chatroom with nickname:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentUserProfile?.id || !currentAuthId) return;

    try {
      // Send message to database
      const newMessage = await sendMessageMutation.mutateAsync({
        chatroom_id: chatroom_id as string,
        message: message.trim(),
        sender_auth_id: currentAuthId,
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
        </View>
      </View>

      {/* Chat Messages Area */}
      <View className="flex-1 bg-orange-50">
        {!isParticipant ? (
          // Show join interface if user is not a participant
          <View className="flex-1 justify-center items-center p-6">
            <View className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
              <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
                Set Your Nickname
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Choose a nickname to use in this chatroom
              </Text>
              
              <View className="mb-4">
                <Input
                  value={nickname}
                  onChangeText={(text) => {
                    setNickname(text);
                    // Clear error when user starts typing
                    if (chatroomJoinError) {
                      setJoinError('');
                    }
                  }}
                  placeholder="Enter your nickname"
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-base ${
                    chatroomJoinError ? 'border-red-500' : 'border-gray-200'
                  }`}
                  maxLength={20}
                />
                {chatroomJoinError && (
                  <Text className="text-red-500 text-sm mt-2 px-1">
                    {chatroomJoinError}
                  </Text>
                )}
              </View>
              
              <Button
                onPress={handleJoinChatroom}
                disabled={!nickname.trim() || joinChatroomMutation.isPending}
                className={`w-full py-3 rounded-xl ${
                  nickname.trim() && !joinChatroomMutation.isPending
                    ? 'bg-orange-500' 
                    : 'bg-gray-300'
                }`}
              >
                <Text className="text-white font-semibold text-base">
                  Set Nickname
                </Text>
              </Button>
            </View>
          </View>
        ) : !messagesLoading && (messagesData?.pages?.[0] as any)?.messages?.length > 0 ? (
          <FlatList
            data={(messagesData.pages[0] as any).messages}
            keyExtractor={(item: ChatMessageType) => item.id}
            renderItem={({ item }: { item: ChatMessageType }) => (
              <ChatMessage 
                message={item} 
                isCurrentUser={item.sender_id === currentUserProfile?.id}
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