import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import supabase from '../lib/supabase';
import { JoinedChatRoom, ChatMessage } from './types';
import { transformChatroomData } from "./useGetChatroom";
import localStorage from '@lib/localstorage';
import { RealtimeChannel } from '@supabase/supabase-js';

const sortChatroomsByLatestMessage = (chatrooms: JoinedChatRoom[]): JoinedChatRoom[] => {
  return chatrooms.sort((a, b) => {
    const aTime = a.latest_message?.created_at;
    const bTime = b.latest_message?.created_at;
    
    if (!aTime && !bTime) return 0;
    
    if (!aTime) return 1;
    if (!bTime) return -1;
    
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
};

export type JoinedChatroomsError = {
  message: string;
  code?: string;
};

export const fetchJoinedChatrooms = async (userId: string): Promise<JoinedChatRoom[]> => {
  if (!userId) {
    return [];
  }

  // Get chatrooms where user is a participant
  const { data: chatroomAggregationData, error } = await supabase
    .from('chatroom_participants')
    .select(`
      *,
      chatroom:chatroom_id(
        *,
        address:address_id(*),
        chatroom_participants(*)
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch joined chatrooms: ${error.message}`);
  }

  if (!chatroomAggregationData || chatroomAggregationData.length === 0) {
    return [];
  }

  const chatroomData = chatroomAggregationData.map(p => p.chatroom);
  const chatroomIds = chatroomData.map(c => c.id);
  
  // Get latest message and calculate unread count for each chatroom
  const chatroomDataPromises = chatroomIds.map(async (chatroomId) => {
    // Get latest message
    const { data: latestMessageData, error: messageError } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:sender_id(*)
      `)
      .eq('chatroom_id', chatroomId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (messageError) {
      console.error(`Failed to fetch latest message for chatroom ${chatroomId}:`, messageError);
    }

    // Calculate unread count
    let unreadCount = 0;
    try {
      const lastReadMessage = await localStorage.getLastReadMessage(chatroomId);
      
      if (!lastReadMessage) {
        // No last read message, count all messages
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chatroom_id', chatroomId);
        unreadCount = count || 0;
      } else {
        // Count messages after last read message
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chatroom_id', chatroomId)
          .gt('created_at', lastReadMessage.created_at);
        unreadCount = count || 0;
      }
    } catch (error) {
      console.error('Failed to calculate unread count:', error);
    }
    
    return {
      chatroomId,
      latestMessage: latestMessageData,
      unreadCount,
    };
  });

  const chatroomDataResults = await Promise.all(chatroomDataPromises);
  
  // Transform data with latest message and unread count
  const joinedChatrooms = chatroomData.map((chatroom, index): JoinedChatRoom => {
    const { latestMessage, unreadCount } = chatroomDataResults[index];
    
    return {
      ...transformChatroomData(chatroom),
      latest_message: latestMessage ? { ...latestMessage } : null,
      unread_count: unreadCount,
    };
  });

  // Sort by latest message timestamp (most recent first)
  return sortChatroomsByLatestMessage(joinedChatrooms);
};

export function useGetJoinedChatrooms(
  userId: string,
  queryOptions?: Partial<UseQueryOptions<JoinedChatRoom[], JoinedChatroomsError>>,
): UseQueryResult<JoinedChatRoom[], JoinedChatroomsError> {
  return useQuery<JoinedChatRoom[], JoinedChatroomsError>({
    queryKey: ["joinedChatrooms", userId],
    queryFn: () => fetchJoinedChatrooms(userId),
    enabled: !!userId,
    ...queryOptions,
  });
}

export function useJoinedChatroomsSubscription(userId: string): void {
  const queryClient = useQueryClient();
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  const handleMessageCreatedEvent = useCallback((chatroomId: string) => (payload: any) => {
    const newMessage = payload.payload as ChatMessage;
    // Only update if the message is not from the current user
    if (newMessage.sender_id === userId) {
      return;
    }

    queryClient.setQueryData(['joinedChatrooms', userId], (oldData: JoinedChatRoom[] | undefined) => {
      if (!oldData) return oldData;
      
      return oldData.map(chatroom => {
        if (chatroom.id === chatroomId) {
          return {
            ...chatroom,
            latest_message: newMessage,
            unread_count: chatroom.unread_count + 1,
          };
        }
        return chatroom;
      });
    });
  }, [queryClient, userId]);

  useEffect(() => {
    if (!userId) return;

    // Get current joined chatrooms to set up subscriptions
    const joinedChatrooms = queryClient.getQueryData(['joinedChatrooms', userId]) as JoinedChatRoom[] | undefined;
    if (!joinedChatrooms) return;

    // Clean up existing channels
    channelsRef.current.forEach(channel => channel.unsubscribe());
    channelsRef.current.clear();

    // Set up subscription for each joined chatroom
    joinedChatrooms.forEach(chatroom => {
      const channel = supabase.channel(chatroom.id, { config: {} });
      
      channel
        .on('broadcast', { event: 'message_created' }, handleMessageCreatedEvent(chatroom.id))
        .subscribe();
      
      channelsRef.current.set(chatroom.id, channel);
    });

    return () => {
      channelsRef.current.forEach(channel => channel.unsubscribe());
      channelsRef.current.clear();
    };
  }, [userId, handleMessageCreatedEvent, queryClient]);

  return;
} 