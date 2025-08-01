import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatMessage } from '../types';
import localStorage from '@lib/localstorage';
import { useChatMessageSubscriptionContext } from './useChatMessageSubscription';

export type SendChatMessageError = {
  message: string;
  code?: string;
};

export type SendChatMessageData = {
  chatroom_id: string;
  message: string;
  sender_id: string;
};

export const sendChatMessage = async (
  data: SendChatMessageData
): Promise<ChatMessage> => {
  // Insert message into database
  const { data: newMessage, error: insertError } = await supabase
    .from('chat_messages')
    .insert({
      chatroom_id: data.chatroom_id,
      sender_id: data.sender_id,
      message: data.message,
      message_type: 'user_message',
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
  const { broadcastMessageCreatedEvent } = useChatMessageSubscriptionContext();

  return useMutation<ChatMessage, SendChatMessageError, SendChatMessageData>({
    mutationFn: sendChatMessage,
    onSuccess: async (newMessage, variables) => {
      // Broadcast the message created event
      await broadcastMessageCreatedEvent(newMessage);
      
      // Invalidate and refetch chat messages
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.chatroom_id] });
      // Update the latest message in joined chatrooms
      queryClient.invalidateQueries({ queryKey: ['joinedChatrooms', variables.sender_id] });
      // Mark the sent message as last read message
      await localStorage.setLastReadMessage(variables.chatroom_id, newMessage);
    },
    ...mutationOptions,
  });
} 