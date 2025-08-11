import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from "../../lib/supabase";

export type ExitChatroomError = {
  message: string;
  code?: string;
};

export type ExitChatroomData = {
  chatroom_id: string;
};

export type ExitChatroomResult = {
  id: string;
  chatroom_id: string;
  user_id: string;
  nickname: string;
  joined_at: string;
};

export const exitChatroom = async (
  data: ExitChatroomData
): Promise<ExitChatroomResult> => {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    throw { message: "No authenticated user found" } as ExitChatroomError;
  }

  const { data: deletedParticipant, error } = await supabase
    .from("chatroom_participants")
    .delete()
    .eq("chatroom_id", data.chatroom_id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    throw { message: `Failed to exit chatroom: ${error.message}`, code: error.code } as ExitChatroomError;
  }

  return deletedParticipant as ExitChatroomResult;
};

export function useExitChatroom(
  mutationOptions?: Partial<UseMutationOptions<ExitChatroomResult, ExitChatroomError, ExitChatroomData>>,
): UseMutationResult<ExitChatroomResult, ExitChatroomError, ExitChatroomData> {
  const queryClient = useQueryClient();

  return useMutation<ExitChatroomResult, ExitChatroomError, ExitChatroomData>({
    mutationFn: exitChatroom,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["chatroomParticipants", variables.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ["joinedChatrooms"] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", variables.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ["unreadChatroomMessageCount", variables.chatroom_id] });
    },
    ...mutationOptions,
  });
}


