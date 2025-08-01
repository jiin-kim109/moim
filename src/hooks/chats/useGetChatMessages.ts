import {
  useInfiniteQuery,
  QueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatMessage } from '../types';

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

export const fetchChatMessages = async (
  chatroomId: string,
  cursor?: string
): Promise<ChatMessagesPage> => {
  if (!chatroomId) {
    throw new Error('Chatroom ID is required');
  }

  let query = supabase
    .from('chat_messages')
    .select(`
      *,
      chatroom!inner(
        chatroom_participants!inner(*)
      )
    `)
    .eq('chatroom_id', chatroomId)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  // Add cursor-based pagination
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: messagesData, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch chat messages: ${error.message}`);
  }

  const rawMessages = messagesData || [];
  const messages = rawMessages.map((message: any) => {
    const senderParticipant = message.chatroom?.chatroom_participants?.find(
      (participant: any) => participant.user_id === message.sender_id
    );
    
    return {
      ...message,
      sender_nickname: senderParticipant?.nickname
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
    staleTime: 0, // Always consider data stale to refetch on load
    refetchOnMount: true, // Always refetch when component mounts
    ...queryOptions,
  });
}