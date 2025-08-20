import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';

export type CheckEmailExistsError = {
  message: string;
  code?: string;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('check_email_exists', {
    email_to_check: email.trim().toLowerCase(),
  });

  if (error) {
    throw new Error(`Failed to check email existence: ${error.message}`);
  }

  return data as boolean;
};

export const checkUserVerified = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('check_user_verified', {
    email_to_check: email.trim().toLowerCase(),
  });

  if (error) {
    throw new Error(`Failed to check user verification status: ${error.message}`);
  }

  return data as boolean;
};

export function useCheckEmailExists(
  mutationOptions?: Partial<UseMutationOptions<boolean, CheckEmailExistsError, string>>,
): UseMutationResult<boolean, CheckEmailExistsError, string> {
  return useMutation<boolean, CheckEmailExistsError, string>({
    mutationFn: (email) => checkEmailExists(email),
    ...mutationOptions,
  });
}

export function useCheckUserVerified(
  mutationOptions?: Partial<UseMutationOptions<boolean, CheckEmailExistsError, string>>,
): UseMutationResult<boolean, CheckEmailExistsError, string> {
  return useMutation<boolean, CheckEmailExistsError, string>({
    mutationFn: (email) => checkUserVerified(email),
    ...mutationOptions,
  });
}
