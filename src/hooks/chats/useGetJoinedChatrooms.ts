import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatRoom } from '../types';
import { transformChatroomData } from './useGetChatroom';

export type JoinedChatroomsError = {
  message: string;
  code?: string;
};

export const fetchJoinedChatrooms = async (userId: string): Promise<ChatRoom[]> => {
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
        participant_count:chatroom_participants(count)
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch joined chatrooms: ${error.message}`);
  }

  return chatroomAggregationData.map(p => transformChatroomData(p.chatroom));
};

export function useGetJoinedChatrooms(
  userId: string,
  queryOptions?: Partial<UseQueryOptions<ChatRoom[], JoinedChatroomsError>>,
): UseQueryResult<ChatRoom[], JoinedChatroomsError> {
  return useQuery<ChatRoom[], JoinedChatroomsError>({
    queryKey: ["joinedChatrooms"],
    queryFn: () => fetchJoinedChatrooms(userId),
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}

export const prefetchJoinedChatrooms = async (
  queryClient: any,
  userId: string
) => {
  if (!userId) return;
  
  await queryClient.prefetchQuery({
    queryKey: ["joinedChatrooms"],
    queryFn: () => fetchJoinedChatrooms(userId),
  });
}; 