import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { ChatRoom } from './types';
import { transformChatroomData } from "./useGetChatroom";

export type PublicChatroomsError = {
  message: string;
  code?: string;
};

export const fetchPublicChatrooms = async (): Promise<ChatRoom[]> => {
  const { data, error } = await supabase
    .from('chatroom')
    .select(`
      *,
      chatroom_participants(*),
      address:address_id(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch chatrooms: ${error.message}`);
  }

  return (data || []).map(transformChatroomData);
};

export function useGetPublicChatrooms(
  queryOptions?: Partial<UseQueryOptions<ChatRoom[], PublicChatroomsError>>,
): UseQueryResult<ChatRoom[], PublicChatroomsError> {
  return useQuery<ChatRoom[], PublicChatroomsError>({
    queryKey: ["publicChatrooms"],
    queryFn: fetchPublicChatrooms,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
} 