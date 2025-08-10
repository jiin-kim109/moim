import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from "../../lib/supabase";
import { ChatRoom } from "../types";
import { FileHolder } from "@lib/objectstore";

export type UpdateChatroomError = {
  message: string;
  code?: string;
};

export type UpdateChatroomData = {
  chatroom_id: string;
  title?: string;
  description?: string | null;
  thumbnail_file?: FileHolder | null;
  max_participants?: number | null;
};

export const updateChatroom = async (
  data: UpdateChatroomData
): Promise<ChatRoom> => {
  const updatePayload: any = {};

  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.max_participants !== undefined) updatePayload.max_participants = data.max_participants;

  if (data.thumbnail_file !== undefined) {
    if (data.thumbnail_file === null) {
      updatePayload.thumbnail_url = null;
    } else {
      const { publicUrl } = await data.thumbnail_file.upload("chatroom-thumbnails");
      updatePayload.thumbnail_url = publicUrl;
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    throw Error("No updates provided");
  }

  const { data: updated, error } = await supabase
    .from("chatroom")
    .update(updatePayload)
    .eq("id", data.chatroom_id)
    .select(`*, address:address_id(*), participant_count:chatroom_participants(count)`) 
    .single();

  if (error) {
    throw { message: `Failed to update chatroom: ${error.message}`, code: error.code } as UpdateChatroomError;
  }

  return updated as ChatRoom;
};

export function useUpdateChatroom(
  mutationOptions?: Partial<UseMutationOptions<ChatRoom, UpdateChatroomError, UpdateChatroomData>>,
): UseMutationResult<ChatRoom, UpdateChatroomError, UpdateChatroomData> {
  const queryClient = useQueryClient();

  return useMutation<ChatRoom, UpdateChatroomError, UpdateChatroomData>({
    mutationFn: updateChatroom,
    onSuccess: (updatedChatroom, variables) => {
      // Invalidate affected caches
      queryClient.invalidateQueries({ queryKey: ["chatroom", variables.chatroom_id] });
      queryClient.invalidateQueries({ queryKey: ["joinedChatrooms"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedChatrooms"] });
    },
    ...mutationOptions,
  });
}


