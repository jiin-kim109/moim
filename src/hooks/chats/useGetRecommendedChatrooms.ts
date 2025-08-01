import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatRoom } from '../types';
import { transformChatroomData } from './useGetChatroom';

export type RecommendedChatroomsError = {
  message: string;
  code?: string;
};

export const fetchRecommendedChatrooms = async (): Promise<ChatRoom[]> => {
  const { data, error } = await supabase
    .from('chatroom')
    .select(`
      *,
      address:address_id(*),
      participant_count:chatroom_participants(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch chatrooms: ${error.message}`);
  }

  return (data || []).map(transformChatroomData);
};

export function useGetRecommendedChatrooms(
  queryOptions?: Partial<UseQueryOptions<ChatRoom[], RecommendedChatroomsError>>,
): UseQueryResult<ChatRoom[], RecommendedChatroomsError> {
  return useQuery<ChatRoom[], RecommendedChatroomsError>({
    queryKey: ["recommendedChatrooms"],
    queryFn: fetchRecommendedChatrooms,
    ...queryOptions,
  });
} 