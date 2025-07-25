import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { UserProfile } from './types';

export type FindUserError = {
  message: string;
  code?: string;
};

export const findUserByUsername = async (username: string): Promise<UserProfile | null> => {
  if (!username || username.trim() === '') {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned, user not found
      return null;
    }
    throw new Error(`Failed to find user: ${error.message}`);
  }

  return data as UserProfile;
};

export function useFindUser(
  username: string,
  queryOptions?: Partial<UseQueryOptions<UserProfile | null, FindUserError>>,
): UseQueryResult<UserProfile | null, FindUserError> {
  return useQuery<UserProfile | null, FindUserError>({
    queryKey: ["findUser", username],
    queryFn: () => findUserByUsername(username),
    enabled: !!username && username.trim() !== '',
    ...queryOptions,
  });
} 