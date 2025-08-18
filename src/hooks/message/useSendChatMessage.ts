import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatMessage } from '../types';
import { useSaveLastReadMessage } from "./useLastReadMessage";

export type SendChatMessageError = {
  message: string;
  code?: string;
};

export type SendChatMessageData = {
  chatroom_id: string;
  message: string;
};

export const sendChatMessage = async (
  data: SendChatMessageData
): Promise<ChatMessage> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data: newMessage, error: insertError } = await supabase
    .from('chat_messages')
    .insert({
      chatroom_id: data.chatroom_id,
      sender_id: user.id,
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
  const saveLastReadMessageMutation = useSaveLastReadMessage();

  return useMutation<ChatMessage, SendChatMessageError, SendChatMessageData>({
    mutationFn: sendChatMessage,
    onSuccess: async (newMessage, variables) => {
      // Prepend the new message to the first page of the chat messages
      queryClient.setQueryData(['chatMessages', variables.chatroom_id], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                messages: [{ ...newMessage }, ...page.messages],
              };
            }
            return page;
          }),
        };
      });

      saveLastReadMessageMutation.mutate({
        chatroomId: variables.chatroom_id,
        messageId: newMessage.id,
      });

      queryClient.setQueryData(['latestChatroomMessage', variables.chatroom_id], newMessage);
      queryClient.invalidateQueries({ queryKey: ['unreadChatroomMessageCount', variables.chatroom_id] });
    },
    ...mutationOptions,
  });
} 