import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { Address, ChatRoom } from '../types';
import { FileHolder } from '@lib/objectstore';

export type CreateChatroomError = {
  message: string;
  code?: string;
};

export type CreateChatroomData = {
  title: string;
  description?: string;
  thumbnail_file?: FileHolder | null; // FileHolder for thumbnail upload
  max_participants?: number;
  host_id: string;
  address: Address;
};



export const createChatroom = async (
  data: CreateChatroomData
): Promise<ChatRoom> => {
  // Upload thumbnail if provided
  let thumbnailUrl: string | null = null;
  if (data.thumbnail_file) {
    try {
      const { publicUrl } = await data.thumbnail_file.upload('chatroom-thumbnails');
      thumbnailUrl = publicUrl;
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      throw new Error('Failed to upload thumbnail image');
    }
  }

  // First create the address
  const { data: newAddress, error: addressError } = await supabase
    .from('address')
    .insert(data.address)
    .select('*')
    .single();

  if (addressError) {
    throw new Error(`Failed to create address: ${addressError.message}`);
  }

  // Then create the chatroom with the address_id
  const { data: newChatroom, error: chatroomError } = await supabase
    .from('chatroom')
    .insert({
      host_id: data.host_id,
      title: data.title,
      description: data.description || null,
      thumbnail_url: thumbnailUrl,
      max_participants: data.max_participants || null,
      address_id: newAddress.id,
    })
    .select(`
      *,
      chatroom_participants(*),
      address:address_id(*)
    `)
    .single();

  if (chatroomError) {
    throw new Error(`Failed to create chatroom: ${chatroomError.message}`);
  }

  return newChatroom;
};

export function useCreateChatroom(
  mutationOptions?: Partial<UseMutationOptions<ChatRoom, CreateChatroomError, CreateChatroomData>>,
): UseMutationResult<ChatRoom, CreateChatroomError, CreateChatroomData> {
  const queryClient = useQueryClient();

  return useMutation<ChatRoom, CreateChatroomError, CreateChatroomData>({
    mutationFn: createChatroom,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['joinedChatrooms', variables.host_id] });
    },
    ...mutationOptions,
  });
} 