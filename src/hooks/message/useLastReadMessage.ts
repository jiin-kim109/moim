import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../types';
import supabase from '../../lib/supabase';

export type LastReadMessageError = {
  message: string;
  code?: string;
};

export type SaveLastReadMessageData = {
  chatroomId: string;
  messageId: string;
};

export const fetchLastReadMessage = async (
  chatroomId: string
): Promise<ChatMessage | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data: lastReadRecord, error: lastReadError } = await supabase
    .from('last_read_messages')
    .select('last_read_message_id')
    .eq('chatroom_id', chatroomId)
    .eq('user_id', user.id)
    .single();

  if (lastReadError || !lastReadRecord?.last_read_message_id) {
    return null; // No last read message found
  }

  const { data: message, error: messageError } = await supabase
    .from('chat_messages')
    .select(`
      *,
      chatroom!inner(
        chatroom_participants!inner(*)
      )
    `)
    .eq('id', lastReadRecord.last_read_message_id)
    .single();

  if (messageError) {
    throw new Error('Message not found');
  }

  const chatroom = message.chatroom as any;
  const participants = chatroom.chatroom_participants || [];
  const senderInfo = participants.find((p: any) => p.user_id === message.sender_id);

  return {
    ...message,
    sender_info: senderInfo || null
  } as ChatMessage;
};

// Hook to get last read message for a chatroom
export function useGetLastReadMessage(chatroomId: string) {
  return useQuery<ChatMessage | null, LastReadMessageError>({
    queryKey: ['lastReadMessage', chatroomId],
    queryFn: () => fetchLastReadMessage(chatroomId),
    enabled: !!chatroomId,
  });
}

// Hook to save last read message for a chatroom
export function useSaveLastReadMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage | null, LastReadMessageError, SaveLastReadMessageData>({
    mutationFn: async ({ chatroomId, messageId }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User is not authenticated');
      }

      const { error } = await supabase
        .from('last_read_messages')
        .upsert({
          chatroom_id: chatroomId,
          user_id: user.id,
          last_read_message_id: messageId,
        }, {
          onConflict: 'chatroom_id,user_id'
        });

      if (error) {
        throw new Error(`Failed to save last read message: ${error.message}`);
      }

      return await fetchLastReadMessage(chatroomId);
    },
    onSuccess: (lastReadMessage, { chatroomId }) => {
      queryClient.setQueryData(['lastReadMessage', chatroomId], lastReadMessage);
      queryClient.invalidateQueries({ queryKey: ['unreadChatroomMessageCount', chatroomId] });
    },
  });
}
