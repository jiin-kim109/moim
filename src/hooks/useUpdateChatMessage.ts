import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { ChatMessage } from './types';

export type UpdateChatMessageError = {
  message: string;
  code?: string;
};

export type DeleteChatMessageError = {
  message: string;
  code?: string;
};

export type UpdateChatMessageData = {
  message_id: string;
  message: string;
};

export type DeleteChatMessageData = {
  message_id: string;
};

export const updateChatMessage = async (
  data: UpdateChatMessageData
): Promise<ChatMessage> => {
  const { data: updatedMessage, error } = await supabase
    .from('chat_messages')
    .update({
      message: data.message,
      is_edited: true,
    })
    .eq('id', data.message_id)
    .select(`
      *,
      sender:sender_id(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update message: ${error.message}`);
  }

  return updatedMessage as ChatMessage;
};

export const deleteChatMessage = async (
  data: DeleteChatMessageData
): Promise<ChatMessage> => {
  const { data: deletedMessage, error } = await supabase
    .from('chat_messages')
    .update({
      is_deleted: true,
    })
    .eq('id', data.message_id)
    .select(`
      *,
      sender:sender_id(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }

  return deletedMessage as ChatMessage;
};

export function useUpdateChatMessage(
  mutationOptions?: Partial<UseMutationOptions<ChatMessage, UpdateChatMessageError, UpdateChatMessageData>>,
): UseMutationResult<ChatMessage, UpdateChatMessageError, UpdateChatMessageData> {
  return useMutation<ChatMessage, UpdateChatMessageError, UpdateChatMessageData>({
    mutationFn: updateChatMessage,
    ...mutationOptions,
  });
}

export function useDeleteChatMessage(
  mutationOptions?: Partial<UseMutationOptions<ChatMessage, DeleteChatMessageError, DeleteChatMessageData>>,
): UseMutationResult<ChatMessage, DeleteChatMessageError, DeleteChatMessageData> {
  return useMutation<ChatMessage, DeleteChatMessageError, DeleteChatMessageData>({
    mutationFn: deleteChatMessage,
    ...mutationOptions,
  });
} 