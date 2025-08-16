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

export const fetchCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select(`
      *,
      address:address_id(*)
    `)
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch current user profile: ${error.message}`);
  }

  return data as UserProfile;
};

export function useGetCurrentUserProfile(
  queryOptions?: Partial<UseQueryOptions<UserProfile | null, UserProfileError>>,
): UseQueryResult<UserProfile | null, UserProfileError> {
  return useQuery<UserProfile | null, UserProfileError>({
    queryKey: ["userProfile"],
    queryFn: fetchCurrentUserProfile,
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
} 

export async function prefetchCurrentUserProfile(queryClient: any) {
  await queryClient.prefetchQuery({
    queryKey: ["userProfile"],
    queryFn: fetchCurrentUserProfile,
  });
}