import { useQuery } from "@tanstack/react-query";
import supabase from '@lib/supabase';
import { fetchLastReadMessage } from '../message/useLastReadMessage';

export type GetUnreadCountError = {
  message: string;
  code?: string;
};

export const fetchUnreadChatroomMessageCount = async (
  chatroomId: string
): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const lastReadMessage = await fetchLastReadMessage(chatroomId);

  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('message_type', 'user_message')
    .eq('chatroom_id', chatroomId)
    .neq('sender_id', user.id) // Exclude user's own messages
    .eq('is_deleted', false) // Only count non-deleted messages
    .order('created_at', { ascending: false });

  if (lastReadMessage && lastReadMessage.created_at) {
    query = query.gt('created_at', lastReadMessage.created_at);
  }

  const { data: unreadMessages, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch unread count: ${error.message}`);
  }

  return unreadMessages?.length || 0;
};

export function useGetUnreadChatroomMessageCount(
  chatroomId: string,
  userId: string,
  queryOptions?: any
) {
  return useQuery<number, GetUnreadCountError>({
    queryKey: ["unreadChatroomMessageCount", chatroomId],
    queryFn: () => fetchUnreadChatroomMessageCount(chatroomId),
    enabled: !!chatroomId && !!userId,
    ...queryOptions,
  });
}

export const prefetchUnreadChatroomMessageCount = async (
  queryClient: any,
  chatroomId: string,
  userId: string
) => {
  if (!chatroomId || !userId) return;
  
  await queryClient.prefetchQuery({
    queryKey: ["unreadChatroomMessageCount", chatroomId],
    queryFn: () => fetchUnreadChatroomMessageCount(chatroomId),
  });
};
