import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { UserProfile, Address } from './types';
import { FileHolder } from '@lib/objectstore';
import { fetchCurrentUserProfile } from "./useGetCurrentUserProfile";

type UpdateUserProfileData = Partial<Omit<UserProfile, 'id' | 'address' | 'profile_image_url'>> & {
  profile_image_file?: FileHolder | null;
  address?: Address;
};

export type UpdateUserError = {
  message: string;
  code?: string;
};

export const updateUserProfile = async (
  updateData: UpdateUserProfileData
): Promise<UserProfile> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }

  const userId = user.id;
  let userUpdateData: any = { ...updateData };

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
    delete userUpdateData.profile_image_file;
  }

  if (updateData.address) {
    const { data: currentUser, error: getUserError } = await supabase
      .from('user_profile')
      .select('address_id')
      .eq('id', userId)
      .single();

    if (getUserError) {
      throw new Error(`Failed to get current user profile: ${getUserError.message}`);
    }

    const existingAddressId = currentUser.address_id;
    
    if (existingAddressId) {
      // Update existing address
      const { error: addressError } = await supabase
        .from('address')
        .update(updateData.address)
        .eq('id', existingAddressId)
        .select()
        .single();

      if (addressError) {
        throw new Error(`Failed to update address: ${addressError.message}`);
      }
    } else {
      // Create new address
      const { data: createdAddress, error: addressError } = await supabase
        .from('address')
        .insert(updateData.address)
        .select()
        .single();

      if (addressError) {
        throw new Error(`Failed to create address: ${addressError.message}`);
      }
      
      userUpdateData.address_id = createdAddress.id;
    }
    
    delete userUpdateData.address;
  }

  if (Object.keys(userUpdateData).length === 0) {
    return await fetchCurrentUserProfile() as UserProfile;
  }

  const { data, error } = await supabase
    .from('user_profile')
    .update(userUpdateData)
    .eq('id', userId)
    .select(`
      *,
      address:address_id(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return data as UserProfile;
};

export function useUpdateUserProfile(
  mutationOptions?: Partial<UseMutationOptions<UserProfile, UpdateUserError, UpdateUserProfileData>>,
): UseMutationResult<UserProfile, UpdateUserError, UpdateUserProfileData> {
  const queryClient = useQueryClient();
  
  return useMutation<UserProfile, UpdateUserError, UpdateUserProfileData>({
    mutationFn: (updateData) => updateUserProfile(updateData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      if (variables.address) {
        queryClient.invalidateQueries({
          queryKey: ["recommendedChatrooms"]
        });
      }

      // If profile image changed, invalidate participants
      if (variables.profile_image_file !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["chatroomParticipants"] });
      }
    },
    ...mutationOptions,
  });
} 