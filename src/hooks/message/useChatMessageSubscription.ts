import React, { useEffect, useRef, useCallback, useState, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../types';
import supabase from '@lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { fetchChatMessage } from './useGetChatMessages';

// Simplified event payloads with message_id only
export type MessageCreatedEventPayload = {
  type: 'message_created';
  chatroom_id: string;
  message_id: string;
};

export type MessageDeletedEventPayload = {
  type: 'message_deleted';
  chatroom_id: string;
  message_id: string;
};

interface ChatMessageSubscriptionContextType {
  subscribe: () => void;
  reconnect: () => Promise<void>;
}

const ChatMessageSubscriptionContext = createContext<ChatMessageSubscriptionContextType | null>(null);

export const useChatMessageSubscriptionContext = () => {
  const context = useContext(ChatMessageSubscriptionContext);
  if (!context) {
    throw new Error('useChatMessageSubscriptionContext must be used within ChatMessageSubscriptionProvider');
  }
  return context;
};

interface ChatMessageSubscriptionProviderProps {
  children: React.ReactNode;
}

export function ChatMessageSubscriptionProvider({ 
  children, 
}: ChatMessageSubscriptionProviderProps) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleMessageCreatedEvent = async (payload: MessageCreatedEventPayload) => {
    const { chatroom_id: chatroomId, message_id: messageId } = payload;
    const newMessage = await fetchChatMessage(messageId);
      
    queryClient.setQueryData(['chatMessages', chatroomId], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: any, index: number) => {
          if (index === 0) {
            return {
              ...page,
              messages: [newMessage, ...page.messages],
            };
          }
          return page;
        }),
      };
    });
      
    queryClient.setQueryData(['latestChatMessage', chatroomId], newMessage);
    queryClient.invalidateQueries({ queryKey: ['unreadChatroomMessageCount', chatroomId] });
      
    // For system messages, also invalidate participants to update participant list
    if (newMessage.message_type === 'system_message') {
      queryClient.invalidateQueries({ queryKey: ['chatroomParticipants', chatroomId] });
    }
  };

  const handleMessageDeletedEvent = async (payload: MessageDeletedEventPayload) => {
    const { chatroom_id: chatroomId, message_id: messageId } = payload;
    queryClient.setQueryData(['chatMessages', chatroomId], (oldData: any) => {
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: ChatMessage) =>
            msg.id === messageId ? { ...msg, is_deleted: true } : msg
          ),
        })),
      };
    });
    queryClient.invalidateQueries({ queryKey: ['latestChatMessage', chatroomId] });
  };

  const subscribe = async () => {
    if (channelRef.current) {
      await unsubscribe();
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const userId = user.id;
    const channel = supabase.channel(userId, { config: {} });
    channel
      .on('broadcast', { event: 'message_created' }, (payload) => handleMessageCreatedEvent(payload.payload as MessageCreatedEventPayload))
      .on('broadcast', { event: 'message_deleted' }, (payload) => handleMessageDeletedEvent(payload.payload as MessageDeletedEventPayload))
      .subscribe();
    channelRef.current = channel;

    return channel;
  };

  const unsubscribe = async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };

  const reconnect = async () => {
    await unsubscribe();
    // fetch chat data 
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['latestChatMessage'] }),
      queryClient.refetchQueries({ queryKey: ['chatMessages'] }),
      queryClient.refetchQueries({ queryKey: ['unreadChatroomMessageCount'] }),
    ]);

    await subscribe();
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      unsubscribe();
    };
  }, []);

  const contextValue = {
    subscribe,
    reconnect,
  };
  
  return React.createElement(
    ChatMessageSubscriptionContext.Provider,
    { value: contextValue },
    children
  );
}