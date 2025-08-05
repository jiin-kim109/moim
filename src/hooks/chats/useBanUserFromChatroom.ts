import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';

export type BanUserError = {
  message: string;
  code?: string;
};

export type UnbanUserError = {
  message: string;
  code?: string;
};

export type BanUserData = {
  chatroom_id: string;
  user_id: string;
};

export type UnbanUserData = {
  chatroom_id: string;
  user_id: string;
};

export type BanUserResult = {
  id: string;
  chatroom_id: string;
  user_id: string;
  last_nickname: string;
  banned_at: string;
};

export type UnbanUserResult = {
  success: boolean;
};

// Function to ban a user from a chatroom
export const banUserFromChatroom = async (
  data: BanUserData
): Promise<BanUserResult> => {
  // First, get the user's nickname from chatroom_participants
  const { data: participant, error: fetchError } = await supabase
    .from('chatroom_participants')
    .select('nickname')
    .eq('chatroom_id', data.chatroom_id)
    .eq('user_id', data.user_id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch user nickname: ${fetchError.message}`);
  }

  if (!participant) {
    throw new Error('User is not a participant in this chatroom');
  }

  // Remove the user from chatroom_participants
  const { error: removeError } = await supabase
    .from('chatroom_participants')
    .delete()
    .eq('chatroom_id', data.chatroom_id)
    .eq('user_id', data.user_id);

  if (removeError) {
    throw new Error(`Failed to remove user from chatroom: ${removeError.message}`);
  }

  // Then, add the user to banned_users table
  const { data: bannedUser, error: banError } = await supabase
    .from('banned_users')
    .insert({
      chatroom_id: data.chatroom_id,
      user_id: data.user_id,
      last_nickname: participant.nickname || 'Unknown User',
    })
    .select('*')
    .single();

  if (banError) {
    throw new Error(`Failed to ban user: ${banError.message}`);
  }

  return bannedUser as BanUserResult;
};

export const unbanUserFromChatroom = async (
  data: UnbanUserData
): Promise<UnbanUserResult> => {
  // Remove the user from banned_users table
  const { error: unbanError } = await supabase
    .from('banned_users')
    .delete()
    .eq('chatroom_id', data.chatroom_id)
    .eq('user_id', data.user_id);

  if (unbanError) {
    throw new Error(`Failed to unban user: ${unbanError.message}`);
  }

  return { success: true };
};

export function useBanUserFromChatroom(
  mutationOptions?: Partial<UseMutationOptions<BanUserResult, BanUserError, BanUserData>>,
): UseMutationResult<BanUserResult, BanUserError, BanUserData> {
  const queryClient = useQueryClient();

  return useMutation<BanUserResult, BanUserError, BanUserData>({
    mutationFn: banUserFromChatroom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatroomParticipants", data.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ["bannedUsers", data.chatroom_id] });
    },
    ...mutationOptions,
  });
}

export function useUnbanUserFromChatroom(
  mutationOptions?: Partial<UseMutationOptions<UnbanUserResult, UnbanUserError, UnbanUserData>>,
): UseMutationResult<UnbanUserResult, UnbanUserError, UnbanUserData> {
  const queryClient = useQueryClient();

  return useMutation<UnbanUserResult, UnbanUserError, UnbanUserData>({
    mutationFn: unbanUserFromChatroom,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatroomParticipants", variables.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ["bannedUsers", variables.chatroom_id] });
    },
    ...mutationOptions,
  });
} 