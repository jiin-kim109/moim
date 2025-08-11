import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatMessage } from '../types';

export type DeleteChatMessageError = {
  message: string;
  code?: string;
};

export type DeleteChatMessageData = {
  message_id: string;
  chatroom_id: string;
};

export const deleteChatMessage = async (
  data: DeleteChatMessageData
): Promise<ChatMessage> => {
  const { data: deletedMessage, error: deleteError } = await supabase
    .from('chat_messages')
    .update({
      is_deleted: true,
      message: '[Message deleted]',
    })
    .eq('id', data.message_id)
    .select(`
      *,
      sender:sender_id(*)
    `)
    .single();

  if (deleteError) {
    throw new Error(`Failed to delete message: ${deleteError.message}`);
  }

  return deletedMessage as ChatMessage;
};

export function useDeleteChatMessage(
  mutationOptions?: Partial<UseMutationOptions<ChatMessage, DeleteChatMessageError, DeleteChatMessageData>>,
): UseMutationResult<ChatMessage, DeleteChatMessageError, DeleteChatMessageData> {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage, DeleteChatMessageError, DeleteChatMessageData>({
    mutationFn: deleteChatMessage,
    onSuccess: async (_, variables) => {
      // Invalidate and refetch chat messages
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.chatroom_id] });
    },
    ...mutationOptions,
  });
}
