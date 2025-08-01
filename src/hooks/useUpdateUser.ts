import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { UserProfile } from './types';
import { FileHolder } from '@lib/objectstore';

type UpdateUserProfileData = Partial<Omit<UserProfile, 'id' | 'address' | 'profile_image_url'>> & {
  profile_image_file?: FileHolder | null;
};

export type UpdateUserError = {
  message: string;
  code?: string;
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateUserProfileData
): Promise<UserProfile> => {
  let userUpdateData: UpdateUserProfileData & { profile_image_url?: string | null } = { ...updateData };

  // Handle profile image file upload
  if (updateData.profile_image_file !== undefined) {
    if (updateData.profile_image_file === null) {
      // Remove profile image
      userUpdateData.profile_image_url = null;
    } else {
      // Upload the file and get the URL
      const { publicUrl } = await updateData.profile_image_file.upload('profile-images');
      userUpdateData.profile_image_url = publicUrl;
    }
    delete (userUpdateData as any).profile_image_file;
  }

  const { data, error } = await supabase
    .from('user_profile')
    .update(userUpdateData)
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