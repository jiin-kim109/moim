import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { ChatRoom } from './types';

export type GetChatroomError = {
  message: string;
  code?: string;
};

export function transformChatroomData(data: any): ChatRoom {
  if (!data) {
    throw new Error("Transforming chatroom data failed: No data provided");
  }

  return {
    ...data,
    participant_count: data.chatroom_participants?.length || 0,
  } as ChatRoom;
}

export const fetchChatroom = async (chatroomId: string): Promise<ChatRoom | null> => {
  if (!chatroomId) {
    return null;
  }

  const { data, error } = await supabase
    .from('chatroom')
    .select(`
      *,
      chatroom_participants(*),
      address:address_id(*)
    `)
    .eq('id', chatroomId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned, chatroom not found
      return null;
    }
    throw new Error(`Failed to fetch chatroom: ${error.message}`);
  }

  return transformChatroomData(data);
};

export function useGetChatroom(
  chatroomId: string,
  queryOptions?: Partial<UseQueryOptions<ChatRoom | null, GetChatroomError>>,
): UseQueryResult<ChatRoom | null, GetChatroomError> {
  return useQuery<ChatRoom | null, GetChatroomError>({
    queryKey: ["chatroom", chatroomId],
    queryFn: () => fetchChatroom(chatroomId),
    enabled: !!chatroomId,
    ...queryOptions,
  });
} 