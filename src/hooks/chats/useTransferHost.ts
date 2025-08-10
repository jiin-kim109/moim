import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';

export type TransferHostError = {
  message: string;
  code?: string;
};

export type TransferHostData = {
  chatroom_id: string;
  new_host_id: string;
};

export type TransferHostResult = {
  old_host_id: string;
  new_host_id: string;
};

export const transferHost = async (
  data: TransferHostData
): Promise<TransferHostResult> => {
  const { data: currentChatroom, error: fetchError } = await supabase
    .from('chatroom')
    .select('host_id')
    .eq('id', data.chatroom_id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch current host: ${fetchError.message}`);
  }

  const { error: transferError } = await supabase
    .from('chatroom')
    .update({ host_id: data.new_host_id })
    .eq('id', data.chatroom_id);

  if (transferError) {
    throw new Error(`Failed to transfer host: ${transferError.message}`);
  }

  return {
    old_host_id: currentChatroom.host_id,
    new_host_id: data.new_host_id,
  };
};

export function useTransferHost(
  mutationOptions?: Partial<UseMutationOptions<TransferHostResult, TransferHostError, TransferHostData>>,
): UseMutationResult<TransferHostResult, TransferHostError, TransferHostData> {
  const queryClient = useQueryClient();

  return useMutation<TransferHostResult, TransferHostError, TransferHostData>({
    mutationFn: transferHost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatroom", variables.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ["chatroomParticipants", variables.chatroom_id] });
    },
    ...mutationOptions,
  });
} 