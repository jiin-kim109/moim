import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import localStorage from '../../lib/localstorage';

export type HideChatMessageError = {
  message: string;
  code?: string;
};

export type HideChatMessageData = {
  message_id: string;
  chatroom_id: string;
};

export const hideChatMessage = async (
  data: HideChatMessageData
): Promise<void> => {
  try {
    await localStorage.addHiddenMessageId(data.chatroom_id, data.message_id);
  } catch (error) {
    throw new Error(`Failed to hide message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export function useHideChatMessage(
  mutationOptions?: Partial<UseMutationOptions<void, HideChatMessageError, HideChatMessageData>>,
): UseMutationResult<void, HideChatMessageError, HideChatMessageData> {
  const queryClient = useQueryClient();

  return useMutation<void, HideChatMessageError, HideChatMessageData>({
    mutationFn: hideChatMessage,
    onSuccess: async (_, variables) => {
      // Invalidate and refetch chat messages to trigger re-render with hidden messages
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.chatroom_id] });
    },
    ...mutationOptions,
  });
}
