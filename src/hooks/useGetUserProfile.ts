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

export const fetchUserProfile = async (auth_id: string | null): Promise<UserProfile | null> => {
  if (!auth_id) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select(`
      id,
      username,
      auth_id,
      is_onboarded,
      address:address_id(*)
    `)
    .eq('auth_id', auth_id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data as UserProfile;
};

export function useGetUserProfile(
  auth_id: string,
  queryOptions?: Partial<UseQueryOptions<UserProfile | null, UserProfileError>>,
): UseQueryResult<UserProfile | null, UserProfileError> {
  return useQuery<UserProfile | null, UserProfileError>({
    queryKey: ["userProfile", auth_id],
    queryFn: () => fetchUserProfile(auth_id),
    ...queryOptions,
  });
} 