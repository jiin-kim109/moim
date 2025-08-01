import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';

export type JoinChatroomError = {
  message: string;
  code?: string;
  isDuplicateNickname?: boolean;
};

export type JoinChatroomData = {
  chatroom_id: string;
  user_id: string;
  nickname: string;
};

export type JoinChatroomResult = {
  id: string;
  chatroom_id: string;
  user_id: string;
  nickname: string | null;
  joined_at: string;
};

export const joinChatroom = async (
  data: JoinChatroomData
): Promise<JoinChatroomResult> => {
  // Check if user is already a participant
  const { data: existingParticipant, error: checkError } = await supabase
    .from('chatroom_participants')
    .select('id')
    .eq('chatroom_id', data.chatroom_id)
    .eq('user_id', data.user_id)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Failed to check existing participation: ${checkError?.message}`);
  }

  // If user is already a participant, throw an error
  if (existingParticipant) {
    throw new Error('User is already a participant in this chatroom');
  }

  // Insert new participant
  const { data: newParticipant, error: insertError } = await supabase
    .from('chatroom_participants')
    .insert({
      chatroom_id: data.chatroom_id,
      user_id: data.user_id,
      nickname: data.nickname || null,
    })
    .select('*')
    .single();

  if (insertError) {
    const errorObj: JoinChatroomError = {
        message: `Failed to join chatroom: ${insertError.message}`,
        code: insertError.code,
    }
    if (insertError.code === '23505') {
        errorObj.isDuplicateNickname = true;
    }
    throw errorObj;
  }

  return newParticipant as JoinChatroomResult;
};

export function useJoinChatroom(
  mutationOptions?: Partial<UseMutationOptions<JoinChatroomResult, JoinChatroomError, JoinChatroomData>>,
): UseMutationResult<JoinChatroomResult, JoinChatroomError, JoinChatroomData> {
  const queryClient = useQueryClient();
  return useMutation<JoinChatroomResult, JoinChatroomError, JoinChatroomData>({
    mutationFn: joinChatroom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", data.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", data.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ['joinedChatrooms', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['chatroomParticipants', data.chatroom_id] });
    },
    ...mutationOptions,
  });
} 