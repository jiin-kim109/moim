import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatRoomParticipant, UserProfile } from '../types';

export type ChatroomParticipantsError = {
  message: string;
  code?: string;
};

export type ChatroomParticipantWithProfile = ChatRoomParticipant & {
  user: UserProfile;
};

export const fetchChatroomParticipants = async (chatroomId: string): Promise<ChatroomParticipantWithProfile[]> => {
  if (!chatroomId) {
    return [];
  }

  const { data, error } = await supabase
    .from('chatroom_participants')
    .select(`
      *
    `)
    .eq('chatroom_id', chatroomId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch chatroom participants: ${error.message}`);
  }

  return data || [];
};

export function useGetChatroomParticipants(
  chatroomId: string,
  queryOptions?: Partial<UseQueryOptions<ChatroomParticipantWithProfile[], ChatroomParticipantsError>>,
): UseQueryResult<ChatroomParticipantWithProfile[], ChatroomParticipantsError> {
  return useQuery<ChatroomParticipantWithProfile[], ChatroomParticipantsError>({
    queryKey: ["chatroomParticipants", chatroomId],
    queryFn: () => fetchChatroomParticipants(chatroomId),
    enabled: !!chatroomId,
    ...queryOptions,
  });
}
