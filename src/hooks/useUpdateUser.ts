import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { UserProfile } from './types';

type UpdateUserProfileData = Partial<Omit<UserProfile, 'id' | 'address'>>;

export type UpdateUserError = {
  message: string;
  code?: string;
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateUserProfileData
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profile')
    .update(updateData)
    .eq('id', userId)
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
  mutationOptions?: Partial<UseMutationOptions<UserProfile, UpdateUserError, { userId: string; updateData: UpdateUserProfileData }>>,
): UseMutationResult<UserProfile, UpdateUserError, { userId: string; updateData: UpdateUserProfileData }> {
  return useMutation<UserProfile, UpdateUserError, { userId: string; updateData: UpdateUserProfileData }>({
    mutationFn: ({ userId, updateData }) => updateUserProfile(userId, updateData),
    ...mutationOptions,
  });
} 