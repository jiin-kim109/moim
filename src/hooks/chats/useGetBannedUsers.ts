import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { UserProfile } from '../types';

export type BannedUser = {
  id: string;
  chatroom_id: string;
  user_id: string;
  last_nickname: string;
  banned_at: string;
  user: UserProfile;
};

export type BannedUsersError = {
  message: string;
  code?: string;
};

export const fetchBannedUsers = async (chatroomId: string): Promise<BannedUser[]> => {
  if (!chatroomId) {
    return [];
  }

  const { data, error } = await supabase
    .from('banned_users')
    .select(`
      *,
      user:user_id(*)
    `)
    .eq('chatroom_id', chatroomId)
    .order('banned_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch banned users: ${error.message}`);
  }

  return data || [];
};

export function useGetBannedUsers(
  chatroomId: string,
  queryOptions?: Partial<UseQueryOptions<BannedUser[], BannedUsersError>>,
): UseQueryResult<BannedUser[], BannedUsersError> {
  return useQuery<BannedUser[], BannedUsersError>({
    queryKey: ["bannedUsers", chatroomId],
    queryFn: () => fetchBannedUsers(chatroomId),
    enabled: !!chatroomId,
    ...queryOptions,
  });
} 