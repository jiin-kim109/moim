import React, { useEffect, useRef, useCallback, useState, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../types';
import supabase from '@lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessageSubscriptionContextType {
  refreshSubscriptions: (chatroomIds: string[]) => void;
  broadcastMessageCreatedEvent: (message: ChatMessage) => Promise<void>;
  broadcastMessageDeletedEvent: (message: ChatMessage) => Promise<void>;
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
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const [subscribedChatroomIds, setSubscribedChatroomIds] = useState<string[]>([]);

  // Event subscription functions
  const handleMessageCreatedEvent = useCallback((chatroomId: string) => (payload: any) => {
    const newMessage = payload.payload as ChatMessage;
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
    
    queryClient.invalidateQueries({ queryKey: ['unreadCount', chatroomId] });
    // Invalidate joined chatrooms to update last message display
    queryClient.invalidateQueries({ queryKey: ['joinedChatrooms'] });
  }, [queryClient]);

  const handleMessageEditedEvent = useCallback((chatroomId: string) => (payload: any) => {
    const editedMessage = payload.payload as ChatMessage;
    queryClient.setQueryData(['chatMessages', chatroomId], (oldData: any) => {
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: ChatMessage) =>
            msg.id === editedMessage.id ? editedMessage : msg
          ),
        })),
      };
    });
  }, [queryClient]);

  const handleMessageDeletedEvent = useCallback((chatroomId: string) => (payload: any) => {
    const deletedMessage = payload.payload as ChatMessage;
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
  }, [queryClient]);

  const handleSystemMessageCreated = useCallback((chatroomId: string) => (payload: any) => {
    const newSystemMessage = payload.payload as ChatMessage;
    
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
    
    // Invalidate joined chatrooms to update last message display
    queryClient.invalidateQueries({ queryKey: ['joinedChatrooms'] });
    // Invalidate chatroom participants to update participant in case it's user in/out of the chatroom
    queryClient.invalidateQueries({ queryKey: ['chatroomParticipants', chatroomId] });
  }, [queryClient]);

  const subscribeToChannel = useCallback((chatroomId: string) => {
    const channel = supabase.channel(chatroomId, {
      config: {},
    });

    channel
      .on('broadcast', { event: 'message_created' }, handleMessageCreatedEvent(chatroomId))
      .on('broadcast', { event: 'message_edited' }, handleMessageEditedEvent(chatroomId))
      .on('broadcast', { event: 'message_deleted' }, handleMessageDeletedEvent(chatroomId))
      .on('broadcast', { event: 'system_message_created' }, handleSystemMessageCreated(chatroomId))
      .subscribe();

    channelsRef.current.set(chatroomId, channel);
    return channel;
  }, [handleMessageCreatedEvent, handleMessageEditedEvent, handleMessageDeletedEvent, handleSystemMessageCreated]);

  const unsubscribeFromChannel = useCallback((chatroomId: string) => {
    const channel = channelsRef.current.get(chatroomId);
    if (channel) {
      channel.unsubscribe();
      channelsRef.current.delete(chatroomId);
    }
  }, []);

  useEffect(() => {
    // Unsubscribe from channels that are no longer needed
    const currentChannels = Array.from(channelsRef.current.keys());
    currentChannels.forEach(chatroomId => {
      if (!subscribedChatroomIds.includes(chatroomId)) {
        unsubscribeFromChannel(chatroomId);
      }
    });

    // Subscribe to new channels
    subscribedChatroomIds.forEach(chatroomId => {
      if (!channelsRef.current.has(chatroomId)) {
        subscribeToChannel(chatroomId);
      }
    });

    return () => {
      // Cleanup all channels on unmount
      channelsRef.current.forEach(channel => channel.unsubscribe());
      channelsRef.current.clear();
    };
  }, [subscribedChatroomIds, subscribeToChannel, unsubscribeFromChannel]);

  const refreshSubscriptions = useCallback((newChatroomIds: string[]) => {
    setSubscribedChatroomIds(newChatroomIds);
  }, []);

  // Event Publisher Functions
  const broadcastMessageCreatedEvent = useCallback(async (message: ChatMessage) => {
    const channel = channelsRef.current.get(message.chatroom_id);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'message_created',
        payload: message,
      });
    }
  }, []);

  const broadcastMessageDeletedEvent = useCallback(async (message: ChatMessage) => {
    const channel = channelsRef.current.get(message.chatroom_id);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'message_deleted',
        payload: message,
      });
    }
  }, []);

  const contextValue = {
    refreshSubscriptions,
    broadcastMessageCreatedEvent,
    broadcastMessageDeletedEvent,
  };
  
  return React.createElement(
    ChatMessageSubscriptionContext.Provider,
    { value: contextValue },
    children
  );
}