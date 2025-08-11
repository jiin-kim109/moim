import React, { useEffect, useRef, useCallback, useState, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../types';
import supabase from '@lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Event payloads for single user channel
export type MessageCreatedEventPayload = {
  type: 'message_created';
  chatroom_id: string;
  message: ChatMessage;
};

export type MessageDeletedEventPayload = {
  type: 'message_deleted';
  chatroom_id: string;
  message: ChatMessage;
};

export type SystemMessageCreatedEventPayload = {
  type: 'system_message_created';
  chatroom_id: string;
  message: ChatMessage;
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

  // Event subscription functions
  const handleMessageCreatedEvent = useCallback((payload: MessageCreatedEventPayload) => {
    console.log('message created', payload);
    const { chatroom_id: chatroomId, message: newMessage } = payload;
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
  }, [queryClient]);


  const handleMessageDeletedEvent = useCallback((payload: MessageDeletedEventPayload) => {
    const { chatroom_id: chatroomId, message: deletedMessage } = payload;
    queryClient.setQueryData(['chatMessages', chatroomId], (oldData: any) => {
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: ChatMessage) =>
            msg.id === deletedMessage.id ? { ...msg, is_deleted: true } : msg
          ),
        })),
      };
    });
    queryClient.invalidateQueries({ queryKey: ['latestChatMessage', chatroomId] });
  }, [queryClient]);

  const handleSystemMessageCreated = useCallback((payload: SystemMessageCreatedEventPayload) => {
    const { chatroom_id: chatroomId, message: newSystemMessage } = payload;
    queryClient.setQueryData(['chatMessages', chatroomId], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: any, index: number) => {
          if (index === 0) {
            return {
              ...page,
              messages: [newSystemMessage, ...page.messages],
            };
          }
          return page;
        }),
      };
    });

    queryClient.setQueryData(['latestChatMessage', chatroomId], newSystemMessage);
    // Invalidate chatroom participants to update participant in case it's user in/out of the chatroom
    queryClient.invalidateQueries({ queryKey: ['chatroomParticipants', chatroomId] });
  }, [queryClient]);

  const subscribe = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const userId = user.id;
    const channel = supabase.channel(userId, { config: {} });
    channel
      .on('broadcast', { event: 'message_created' }, (payload) => handleMessageCreatedEvent(payload.payload as MessageCreatedEventPayload))
      .on('broadcast', { event: 'message_deleted' }, (payload) => handleMessageDeletedEvent(payload.payload as MessageDeletedEventPayload))
      .on('broadcast', { event: 'system_message_created' }, (payload) => handleSystemMessageCreated(payload.payload as SystemMessageCreatedEventPayload))
      .subscribe();
    channelRef.current = channel;
    return channel;
  }, [handleMessageCreatedEvent, handleMessageDeletedEvent, handleSystemMessageCreated]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  const reconnect = useCallback(async () => {
    supabase.realtime.connect();
    // fetch chat data 
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['latestChatMessage'] }),
      queryClient.refetchQueries({ queryKey: ['chatMessages'] }),
      queryClient.refetchQueries({ queryKey: ['unreadChatroomMessageCount'] }),
    ]);

    unsubscribe();
    subscribe();
  }, [subscribe, unsubscribe]);

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