import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';

export type UpdateNicknameError = {
  message: string;
  code?: string;
  isDuplicateNickname?: boolean;
};

export type UpdateNicknameData = {
  chatroom_id: string;
  user_id: string;
  nickname: string;
};

export type UpdateNicknameResult = {
  id: string;
  chatroom_id: string;
  user_id: string;
  nickname: string;
  joined_at: string;
};

export const updateNickname = async (
  data: UpdateNicknameData
): Promise<UpdateNicknameResult> => {
  // Update the participant's nickname
  const { data: updatedParticipant, error: updateError } = await supabase
    .from('chatroom_participants')
    .update({ nickname: data.nickname })
    .eq('chatroom_id', data.chatroom_id)
    .eq('user_id', data.user_id)
    .select('*')
    .single();


  if (updateError) {
    const errorObj = {
        message: `Failed to update nickname: ${updateError.message}`,
        code: updateError.code,
        isDuplicateNickname: false,
    }

    if (updateError.code === '23505') {
      errorObj.isDuplicateNickname = true;
    }

    throw errorObj;
  }

  return updatedParticipant as UpdateNicknameResult;
};

export function useUpdateNickname(
  mutationOptions?: Partial<UseMutationOptions<UpdateNicknameResult, UpdateNicknameError, UpdateNicknameData>>,
): UseMutationResult<UpdateNicknameResult, UpdateNicknameError, UpdateNicknameData> {
  const queryClient = useQueryClient();
  return useMutation<UpdateNicknameResult, UpdateNicknameError, UpdateNicknameData>({
    mutationFn: updateNickname,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatroomParticipants", variables.chatroom_id] });
    },
    ...mutationOptions,
  });
} 