import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { UserProfile, Address } from './types';

export type UpdateUserAddressError = {
  message: string;
  code?: string;
};

export const updateUserAddress = async (
  userId: string,
  addressData: Address
): Promise<UserProfile> => {
  let oldAddressId: string | null = null;

  // 1. Get current user's address_id if they have one
  const { data: currentUser, error: getUserError } = await supabase
    .from('user_profile')
    .select('address_id')
    .eq('id', userId)
    .single();

  if (getUserError) {
    throw new Error(`Failed to get current user profile: ${getUserError.message}`);
  }

  oldAddressId = currentUser.address_id;

  // 2. Insert new address
  const { data: createdAddress, error: addressError } = await supabase
    .from('address')
    .insert(addressData)
    .select()
    .single();

  if (addressError) {
    throw new Error(`Failed to create address: ${addressError.message}`);
  }

  // 3. Update user profile to reference the new address
  const { data: updatedUser, error: userError } = await supabase
    .from('user_profile')
    .update({ address_id: createdAddress.id })
    .eq('id', userId)
    .select(`
      *,
      address:address_id(*)
    `)
    .single();

  if (userError) {
    throw new Error(`Failed to update user profile: ${userError.message}`);
  }

  // 4. Remove old address if it existed
  if (oldAddressId) {
    const { error: deleteError } = await supabase
      .from('address')
      .delete()
      .eq('id', oldAddressId);

    if (deleteError) {
      console.warn(`Failed to delete old address: ${deleteError.message}`);
    }
  }

  return updatedUser as UserProfile;
};

export function useUpdateUserAddress(
  mutationOptions?: Partial<UseMutationOptions<UserProfile, UpdateUserAddressError, { userId: string; addressData: Address }>>,
): UseMutationResult<UserProfile, UpdateUserAddressError, { userId: string; addressData: Address }> {
  return useMutation<UserProfile, UpdateUserAddressError, { userId: string; addressData: Address }>({
    mutationFn: ({ userId, addressData }) => updateUserAddress(userId, addressData),
    ...mutationOptions,
  });
} 