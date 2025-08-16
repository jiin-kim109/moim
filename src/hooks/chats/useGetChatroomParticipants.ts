import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatRoomParticipant } from '../types';

export type ChatroomParticipantsError = {
  message: string;
  code?: string;
};

export const fetchChatroomParticipants = async (chatroomId: string): Promise<ChatRoomParticipant[]> => {
  if (!chatroomId) {
    return [];
  }

  const { data, error } = await supabase
    .from('chatroom_participants')
    .select('*')
    .eq('chatroom_id', chatroomId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch chatroom participants: ${error.message}`);
  }

  return data || [];
};

export function useGetChatroomParticipants(
  chatroomId: string,
  queryOptions?: Partial<UseQueryOptions<ChatRoomParticipant[], ChatroomParticipantsError>>,
): UseQueryResult<ChatRoomParticipant[], ChatroomParticipantsError> {
  return useQuery<ChatRoomParticipant[], ChatroomParticipantsError>({
    queryKey: ["chatroomParticipants", chatroomId],
    queryFn: () => fetchChatroomParticipants(chatroomId),
    enabled: !!chatroomId,
    ...queryOptions,
  });
}

export const prefetchChatroomParticipants = async (
  queryClient: any,
  chatroomId: string
) => {
  if (!chatroomId) return;
  
  await queryClient.prefetchQuery({
    queryKey: ["chatroomParticipants", chatroomId],
    queryFn: () => fetchChatroomParticipants(chatroomId),
  });
};
