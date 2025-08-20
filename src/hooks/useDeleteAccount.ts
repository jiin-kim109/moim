import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useRouter } from 'expo-router';
import supabase from '../lib/supabase';

export type DeleteAccountError = {
  message: string;
  code?: string;
};

export const deleteAccount = async (): Promise<void> => {
  const { error } = await supabase.rpc('delete_own_account');

  if (error) {
    throw new Error(`Failed to delete account: ${error.message}`);
  }

  // Sign out the user after successful account deletion
  await supabase.auth.signOut();
};

export function useDeleteAccount(
  mutationOptions?: Partial<UseMutationOptions<void, DeleteAccountError, void>>,
): UseMutationResult<void, DeleteAccountError, void> {
  return useMutation<void, DeleteAccountError, void>({
    mutationFn: deleteAccount,
    ...mutationOptions,
  });
}
