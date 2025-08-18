import {
  useInfiniteQuery,
  QueryClient,
} from "@tanstack/react-query";
import supabase from '@lib/supabase';
import { ChatMessage, ChatRoomParticipant } from '../types';

export type GetChatMessagesError = {
  message: string;
  code?: string;
};

export type ChatMessagesPage = {
  messages: ChatMessage[];
  nextCursor?: string;
  hasMore: boolean;
};

const PAGE_SIZE = 30;

// Fetch chatroom participants for the chatroom
export const fetchChatroomParticipants = async (chatroomId: string): Promise<Map<string, ChatRoomParticipant>> => {
  const { data, error } = await supabase
    .from('chatroom_participants')
    .select('*')
    .eq('chatroom_id', chatroomId);

  if (error) {
    throw new Error(`Failed to fetch chatroom participants: ${error.message}`);
  }

  const participantsMap = new Map<string, ChatRoomParticipant>();
  (data || []).forEach((participant) => {
    participantsMap.set(participant.user_id, participant);
  });

  return participantsMap;
};

export const fetchChatMessage = async (messageId: string): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch chat message: ${error.message}`);
  }

  let senderInfo = null;
  const participantsMap = await fetchChatroomParticipants(data.chatroom_id);
  senderInfo = participantsMap.get(data.sender_id) || null;
  
  return {
    ...data,
    sender_info: senderInfo
  } as ChatMessage;
}

export const fetchChatMessages = async (
  chatroomId: string,
  cursor?: string
): Promise<ChatMessagesPage> => {
  if (!chatroomId) {
    throw new Error('Chatroom ID is required');
  }

  const participantsMap = await fetchChatroomParticipants(chatroomId);

  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('chatroom_id', chatroomId)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: messagesData, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch chat messages: ${error.message}`);
  }

  const messages = (messagesData || []).map((message: any) => {
    const senderInfo = participantsMap.get(message.sender_id) || null;
    
    return {
      ...message,
      sender_info: senderInfo
    };
  }) as ChatMessage[];

  const hasMore = messages.length === PAGE_SIZE;
  const nextCursor = hasMore && messages.length > 0 
    ? messages[messages.length - 1].created_at 
    : undefined;

  return {
    messages,
    nextCursor,
    hasMore,
  };
};

export function useGetChatMessages(
  chatroomId: string,
  queryOptions?: any,
) {
  return useInfiniteQuery({
    queryKey: ["chatMessages", chatroomId],
    queryFn: ({ pageParam }) => fetchChatMessages(chatroomId, pageParam as string | undefined),
    enabled: !!chatroomId,
    getNextPageParam: (lastPage: ChatMessagesPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    ...queryOptions,
  });
}

export const prefetchChatMessages = async (
  queryClient: QueryClient,
  chatroomId: string
) => {
  if (!chatroomId) return;
  
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["chatMessages", chatroomId],
    queryFn: ({ pageParam }) => fetchChatMessages(chatroomId, pageParam as string | undefined),
    initialPageParam: undefined,
  });
};
