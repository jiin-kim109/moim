import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatRoom } from '../types';

// Shared function to transform chatroom data from Supabase format to our ChatRoom type
export const transformChatroomData = (rawChatroom: any): ChatRoom => {
  if (!rawChatroom) return rawChatroom;
  
  return {
    ...rawChatroom,
    participant_count: Array.isArray(rawChatroom.participant_count) 
      ? rawChatroom.participant_count[0]?.count || 0 
      : rawChatroom.participant_count || 0
  };
};

export type ChatroomError = {
  message: string;
  code?: string;
};

export const fetchChatroom = async (chatroomId: string): Promise<ChatRoom | null> => {
  if (!chatroomId) {
    return null;
  }

  const { data, error } = await supabase
    .from('chatroom')
    .select(`
      *,
      address:address_id(*),
      participant_count:chatroom_participants(count)
    `)
    .eq('id', chatroomId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch chatroom: ${error.message}`);
  }

  return transformChatroomData(data);
};

export function useGetChatroom(
  chatroomId: string,
  queryOptions?: Partial<UseQueryOptions<ChatRoom | null, ChatroomError>>,
): UseQueryResult<ChatRoom | null, ChatroomError> {
  return useQuery<ChatRoom | null, ChatroomError>({
    queryKey: ["chatroom", chatroomId],
    queryFn: () => fetchChatroom(chatroomId),
    enabled: !!chatroomId,
    ...queryOptions,
  });
}
