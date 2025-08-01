import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { UserProfile } from './types';

export type UserProfileError = {
  message: string;
  code?: string;
};

export const fetchUserProfile = async (userId: string | null): Promise<UserProfile | null> => {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select(`
      *,
      address:address_id(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data as UserProfile;
};

export function useGetUserProfile(
  userId: string,
  queryOptions?: Partial<UseQueryOptions<UserProfile | null, UserProfileError>>,
): UseQueryResult<UserProfile | null, UserProfileError> {
  return useQuery<UserProfile | null, UserProfileError>({
    queryKey: ["userProfile", userId],
    queryFn: () => fetchUserProfile(userId),
    ...queryOptions,
  });
} 