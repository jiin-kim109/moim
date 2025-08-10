import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';

export type KickUserError = {
  message: string;
  code?: string;
};

export type KickUserData = {
  chatroom_id: string;
  user_id: string;
};

export type KickUserResult = {
  success: boolean;
};

// Function to kick a user from a chatroom
export const kickUserFromChatroom = async (
  data: KickUserData
): Promise<KickUserResult> => {
    console.log('Kicking user from chatroom', data);
  // Remove the user from chatroom_participants
  const { error: kickError } = await supabase
    .from('chatroom_participants')
    .delete()
    .eq('chatroom_id', data.chatroom_id)
    .eq('user_id', data.user_id);
    
  if (kickError) {
    throw new Error(`Failed to kick user from chatroom: ${kickError.message}`);
  }

  return { success: true };
};

export function useKickUserFromChatroom(
  mutationOptions?: Partial<UseMutationOptions<KickUserResult, KickUserError, KickUserData>>,
): UseMutationResult<KickUserResult, KickUserError, KickUserData> {
  const queryClient = useQueryClient();

  return useMutation<KickUserResult, KickUserError, KickUserData>({
    mutationFn: kickUserFromChatroom,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatroomParticipants", variables.chatroom_id] });
    },
    ...mutationOptions,
  });
} 