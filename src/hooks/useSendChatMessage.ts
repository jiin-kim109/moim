import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { ChatMessage } from './types';

export type SendChatMessageError = {
  message: string;
  code?: string;
};

export type SendChatMessageData = {
  chatroom_id: string;
  message: string;
  sender_auth_id: string;
};

export const sendChatMessage = async (
  data: SendChatMessageData
): Promise<ChatMessage> => {
  // Get user's profile to get sender_id
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profile')
    .select('id')
    .eq('auth_id', data.sender_auth_id)
    .single();

  if (profileError) {
    throw new Error(`Failed to get user profile: ${profileError.message}`);
  }

  // Insert message into database
  const { data: newMessage, error: insertError } = await supabase
    .from('chat_messages')
    .insert({
      chatroom_id: data.chatroom_id,
      sender_id: userProfile.id,
      message: data.message,
    })
    .select(`
      *,
      sender:sender_id(*)
    `)
    .single();

  if (insertError) {
    throw new Error(`Failed to send message: ${insertError.message}`);
  }

  return newMessage as ChatMessage;
};

export function useSendChatMessage(
  mutationOptions?: Partial<UseMutationOptions<ChatMessage, SendChatMessageError, SendChatMessageData>>,
): UseMutationResult<ChatMessage, SendChatMessageError, SendChatMessageData> {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage, SendChatMessageError, SendChatMessageData>({
    mutationFn: sendChatMessage,
    onSuccess: (newMessage, variables) => {
      // Invalidate and refetch chat messages
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.chatroom_id] });
    },
    ...mutationOptions,
  });
} 