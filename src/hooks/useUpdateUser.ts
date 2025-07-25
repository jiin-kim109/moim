import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { UserProfile } from './types';

type UpdateUserProfileData = Partial<Omit<UserProfile, 'id' | 'auth_id' | 'address'>>;

export type UpdateUserError = {
  message: string;
  code?: string;
};

export const updateUserProfile = async (
  authId: string,
  updateData: UpdateUserProfileData
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profile')
    .update(updateData)
    .eq('auth_id', authId)
    .select(`
      *
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return data as UserProfile;
};

export function useUpdateUser(
  mutationOptions?: Partial<UseMutationOptions<UserProfile, UpdateUserError, { authId: string; updateData: UpdateUserProfileData }>>,
): UseMutationResult<UserProfile, UpdateUserError, { authId: string; updateData: UpdateUserProfileData }> {
  return useMutation<UserProfile, UpdateUserError, { authId: string; updateData: UpdateUserProfileData }>({
    mutationFn: ({ authId, updateData }) => updateUserProfile(authId, updateData),
    ...mutationOptions,
  });
} 