import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../types';
import { localStorage } from '../../lib/localstorage';

export type LastReadMessageError = {
  message: string;
  code?: string;
};

export type SaveLastReadMessageData = {
  chatroomId: string;
  message: ChatMessage;
};

// Hook to get last read message for a chatroom
export function useGetLastReadMessage(chatroomId: string) {
  return useQuery<ChatMessage | null, LastReadMessageError>({
    queryKey: ['lastReadMessage', chatroomId],
    queryFn: () => localStorage.getLastReadMessage(chatroomId),
    enabled: !!chatroomId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to save last read message for a chatroom
export function useSaveLastReadMessage() {
  const queryClient = useQueryClient();

  return useMutation<void, LastReadMessageError, SaveLastReadMessageData>({
    mutationFn: async ({ chatroomId, message }) => {
      await localStorage.setLastReadMessage(chatroomId, message);
    },
    onSuccess: (_, { chatroomId }) => {
      // Invalidate the last read message query for this chatroom
      queryClient.invalidateQueries({ queryKey: ['lastReadMessage', chatroomId] });
      // Invalidate unread count for this chatroom
      queryClient.invalidateQueries({ queryKey: ['unreadCount', chatroomId] });
    },
  });
}
