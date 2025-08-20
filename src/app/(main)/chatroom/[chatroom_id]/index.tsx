import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send, MapPin, Users, Edit, Trash2, Settings } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import ChatMessage from '@components/ChatMessage';
import JoinChatroomForm from '@components/JoinChatroomForm';

import { useGetChatroom } from '@hooks/chats/useGetChatroom';
import { useGetChatMessages } from '@hooks/message/useGetChatMessages';
import { useGetChatroomParticipants } from '@hooks/chats/useGetChatroomParticipants';
import { useSendChatMessage } from '@hooks/message/useSendChatMessage';
import { useSaveLastReadMessage, useGetLastReadMessage } from '@hooks/message/useLastReadMessage';
import { useDeleteChatMessage } from '@hooks/message/useDeleteChatMessage';
import { useHideChatMessage } from '@hooks/message/useHideChatMessage';
import { ChatMessage as ChatMessageType } from '@hooks/types';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useDebouncedFunction } from '@lib/utils';
import localStorage from '@lib/localstorage';
import { Textarea } from '@components/ui/textarea';

export default function ChatroomScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();

  const [messageInputValue, setMessageInputValue] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ChatMessageType | null>(null);
  const [hiddenMessageIds, setHiddenMessageIds] = useState<string[]>([]);
  
  const { data: userProfile, isLoading: userProfileLoading } = useGetCurrentUserProfile();
  const { data: chatroom } = useGetChatroom(chatroom_id as string);
  const { data: participants, isLoading: participantsLoading } = useGetChatroomParticipants(chatroom_id as string);
  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetChatMessages(chatroom_id as string);
  const { data: lastReadMessage, isLoading: lastReadMessageLoading } = useGetLastReadMessage(chatroom_id as string);
  const sendMessageMutation = useSendChatMessage();
  const saveLastReadMessageMutation = useSaveLastReadMessage();
  const deleteMessageMutation = useDeleteChatMessage();
  const hideMessageMutation = useHideChatMessage();

  const flatListRef = useRef<FlatList>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const currentUserId = userProfile?.id;
  const isParticipant = participants?.find(
    (participant) => participant.user_id === currentUserId
  );
  const isHost = chatroom?.host_id === currentUserId;

  // Load hidden message IDs on mount
  useEffect(() => {
    const loadHiddenMessageIds = async () => {
      if (chatroom_id) {
        const hiddenIds = await localStorage.getHiddenMessageIds(chatroom_id as string);
        setHiddenMessageIds(hiddenIds);
      }
    };
    loadHiddenMessageIds();
  }, [chatroom_id]);

  // Update last read message when entering chatroom
  // Only update if we don't have a last read message yet (first time entering chatroom)
  // or if there are newer messages since our last read
  useEffect(() => {
    if (!(messagesData?.pages?.[0] as any)?.messages?.[0] || lastReadMessageLoading || !currentUserId) {
      return;
    }

    const latestChatroomMessage = (messagesData.pages[0] as any)?.messages[0] as ChatMessageType;
    
    if (!lastReadMessage || (latestChatroomMessage && lastReadMessage.id !== latestChatroomMessage.id)) {
      saveLastReadMessageMutation.mutate({
        chatroomId: chatroom_id as string,
        messageId: latestChatroomMessage.id,
      });
    }
  }, [chatroom_id, currentUserId, (messagesData?.pages?.[0] as any)?.messages?.[0]?.id, lastReadMessage?.id]);

  // Auto-scroll to bottom when sending a message
  useEffect(() => {
    if (!messagesData?.pages?.[0]) return;
    
    const messages = (messagesData.pages[0] as any)?.messages;
    if (messages.length > 0) {
      // Small delay to ensure the FlatList has rendered the new message
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messagesData?.pages?.[0]]);

  const handleGoBack = useDebouncedFunction(() => router.back());
  const handleOpenParticipants = useDebouncedFunction(() => router.push(`/chatroom/${chatroom_id}/participants`));
  const handleOpenSettings = useDebouncedFunction(() => router.push(`/chatroom/${chatroom_id}/settings`));

  // Handle long press on chat message
  const handleMessageLongPress = useCallback((message: ChatMessageType) => {
    setSelectedMessage(message);
    bottomSheetRef.current?.expand();
  }, []);

  const handleSend = async () => {
    if (!messageInputValue.trim() || !currentUserId) return;

    try {
      // Send message to database
      await sendMessageMutation.mutateAsync({
        chatroom_id: chatroom_id as string,
        message: messageInputValue.trim(),
      });

      setMessageInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleMessageListEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async () => {
    if (!selectedMessage || !chatroom_id) return;

    if (isHost || selectedMessage.sender_id === currentUserId) {
      Alert.alert(
        'Delete Message',
        'This message will be deleted for everyone in the chatroom. This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMessageMutation.mutateAsync({
                  message_id: selectedMessage.id,
                  chatroom_id: chatroom_id as string,
                });
                bottomSheetRef.current?.close();
                setSelectedMessage(null);
              } catch (error) {
                console.error('Failed to delete message:', error);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Hide Message',
        'This message will only be hidden for you. Other participants will still see it.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Hide',
            style: 'destructive',
            onPress: async () => {
              try {
                await hideMessageMutation.mutateAsync({
                  message_id: selectedMessage.id,
                  chatroom_id: chatroom_id as string,
                });
                setHiddenMessageIds(prev => [...prev, selectedMessage.id]);
                bottomSheetRef.current?.close();
                setSelectedMessage(null);
              } catch (error) {
                console.error('Failed to hide message:', error);
              }
            },
          },
        ]
      );
    }
  }, [selectedMessage, chatroom_id, isHost, currentUserId, deleteMessageMutation, hideMessageMutation]);

  const filteredMessages = useMemo(() => {
    const pages = (messagesData?.pages as any[]) || [];
    const mergedDescending: ChatMessageType[] = pages.flatMap((p: any) => p.messages || []);
    return mergedDescending.filter((m: ChatMessageType) => !hiddenMessageIds.includes(m.id));
  }, [messagesData?.pages, hiddenMessageIds]);

  const renderItem = useCallback(({ item }: { item: ChatMessageType }) => (
    <ChatMessage 
      message={item} 
      isCurrentUser={item.sender_id === currentUserId}
      onLongPress={handleMessageLongPress}
    />
  ), [currentUserId, handleMessageLongPress]);

  const listFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 12 }}>
        <ActivityIndicator />
      </View>
    );
  }, [isFetchingNextPage]);

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

    return (
      <FlatList
        ref={flatListRef}
        data={filteredMessages}
        keyExtractor={(item: ChatMessageType) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexGrow: 1,
          justifyContent: 'flex-end'
        }}
        inverted
        onEndReachedThreshold={0.1}
        onEndReached={handleMessageListEndReached}
        maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
        ListFooterComponent={listFooterComponent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={20}
        windowSize={10}
      />
    );
  };

  return (
    <GestureHandlerRootView className="flex-1 bg-orange-50">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View pointerEvents="box-none" className="flex-1 mt-16">
          {/* Header */}
          <View className="flex-row items-center px-4 py-2 bg-orange-50">
            <TouchableOpacity
              onPress={handleGoBack}
              className="mr-3 p-2 -ml-2"
            >
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>

            <View className="flex-1">
              <View className="flex-row items-center gap-3">
                <Text className="text-xl font-semibold text-gray-900">
                  {chatroom?.title && chatroom.title.length > 25 ? `${chatroom.title.substring(0, 25)}...` : chatroom?.title}
                </Text>
                <Text className="text-lg text-gray-500">
                  {participants?.length || 0}
                </Text>
              </View>

              {/* Location */}
              {chatroom?.address && (
                <View className="flex-row items-center gap-1 mb-1">
                  <MapPin size={12} color="#6B7280" />
                  <Text className="text-base text-gray-500">
                    {chatroom.address.place_name}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Action Button */}
            {isHost && (
              <TouchableOpacity
                onPress={handleOpenSettings}
                className="p-2 mr-1"
              >
                <Settings size={24} color="#000" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleOpenParticipants}
              className="p-2 -mr-2"
            >
              <Users size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Chat Messages Area */}
          <View className="flex-1 bg-orange-50">
            {renderChatContent()}
          </View>
        </View>
        
        {/* Message Input Area */}
        <View className="px-4 pb-8 pt-4 bg-white border-t border-gray-200">
          <View className="flex-row items-center px-2 gap-3">
            <View className="flex-1">
              <Textarea
                value={messageInputValue}
                onChangeText={setMessageInputValue}
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
              disabled={!isParticipant || !messageInputValue.trim()}
              size="icon"
              className={`w-12 h-12 rounded-full ${
                messageInputValue.trim() ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <Send 
                size={20} 
                color="white" 
                style={{ marginLeft: 2 }}
              />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>

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
                    From: {selectedMessage.sender_info.nickname}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    "{selectedMessage.message.substring(0, 50)}{selectedMessage.message.length > 50 ? '...' : ''}"
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="gap-4">
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