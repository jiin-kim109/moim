import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from './types';
import supabase from '@lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useChatMessageSubscription(chatroomId: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel>(null);

  const handleMessageCreatedEvent = useCallback((payload: any) => {
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
  }, [queryClient, chatroomId]);

  const handleMessageEditedEvent = useCallback((payload: any) => {
    const editedMessage = payload.payload as ChatMessage;
    queryClient.setQueryData(['chatMessages', chatroomId], (oldData: any) => {
      if (!oldData) return oldData;
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
  }, [queryClient, chatroomId]);

  const handleMessageDeletedEvent = useCallback((payload: any) => {
    const deletedMessage = payload.payload as ChatMessage;
    queryClient.setQueryData(['chatMessages', chatroomId], (oldData: any) => {
      if (!oldData) return oldData;
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
  }, [queryClient, chatroomId]);

  useEffect(() => {
    const channel = supabase.channel(chatroomId, {
      config: {},
    });
    channelRef.current = channel;

    // Subscribe to message events
    channel
      .on('broadcast', { event: 'message_created' }, handleMessageCreatedEvent)
      .on('broadcast', { event: 'message_edited' }, handleMessageEditedEvent)
      .on('broadcast', { event: 'message_deleted' }, handleMessageDeletedEvent)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [chatroomId, handleMessageCreatedEvent, handleMessageEditedEvent, handleMessageDeletedEvent]);

  const broadcastMessageCreatedEvent = async (message: ChatMessage) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'message_created',
        payload: message,
      });
    }
  }
  
  return { channelRef, broadcastMessageCreatedEvent };
}