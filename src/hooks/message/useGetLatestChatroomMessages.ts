import { useQueries } from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatMessage } from '../types';

export const fetchLatestChatroomMessage = async (
  chatroomId: string
): Promise<ChatMessage | null> => {
   if (!chatroomId) return null;

   let query = supabase
     .from('chat_messages')
     .select(`
       *,
       sender:user_profile(*),
       chatroom!inner(
         chatroom_participants!inner(*)
       )
     `)
     .eq('chatroom_id', chatroomId)
     .order('created_at', { ascending: false })
     .limit(1);

   const { data: messagesData, error } = await query;
   if (error) {
     throw new Error(`Failed to fetch latest chat message: ${error.message}`);
   }
  
    const raw = messagesData?.[0];
    if (!raw) return null;

    const senderParticipant = raw.chatroom?.chatroom_participants?.find(
        (participant: any) => participant.user_id === raw.sender_id
    );

    const message: ChatMessage = {
    ...raw,
    sender_nickname: senderParticipant?.nickname,
    };

    return message;
};
  

export function useGetLatestChatroomMessages(chatroomIds: string[]) {
  const latestMessageQueries = useQueries({
    queries: chatroomIds.map((chatroomId) => ({
      queryKey: ["latestChatMessage", chatroomId],
      queryFn: () => fetchLatestChatroomMessage(chatroomId),
      enabled: !!chatroomId,
    })),
  });

  return latestMessageQueries;
}