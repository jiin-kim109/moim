import React, { useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import supabase from '@lib/supabase';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { H1, P, Muted } from '@components/ui/typography';
import Logo from '@lib/icons/Logo';
import { useCheckEmailExists } from '@hooks/useCheckEmailExists';

const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkEmailExistsMutation = useCheckEmailExists();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    setLoading(true);
    setAuthError(null);
    
    const emailExists = await checkEmailExistsMutation.mutateAsync(values.email.trim());
    if (emailExists) {
      setAuthError('An account with this email already exists. Please sign in instead.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: 'moim://auth/callback',
      },
    });
    
    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    // Navigate to email verification screen
    router.replace(`/auth/verify-email?email=${encodeURIComponent(values.email.trim())}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          <View className="flex-1 justify-center px-8">
            <View className="w-full max-w-sm mx-auto">
              {/* Header */}
              <View className="items-center mb-8">
                <Logo size="xl" className="mb-4" />
                <H1 className="text-center mb-2">Create Account</H1>
                <P className="text-center text-muted-foreground">
                  Join the conversation
                </P>
              </View>
              
              {/* Sign Up Form */}
              <Form {...form}>
                <View>
                  {/* Global Auth Error */}
                  {authError && (
                    <View className="bg-destructive/10 border border-destructive rounded-md p-3 mb-6">
                      <Text className="text-destructive text-sm">{authError}</Text>
                    </View>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="email@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Create a strong password"
                            secureTextEntry
                            autoCapitalize="none"
                            error={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem className="mb-6">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Confirm your password"
                            secureTextEntry
                            autoCapitalize="none"
                            error={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    onPress={form.handleSubmit(handleSignUp)}
                    disabled={loading || checkEmailExistsMutation.isPending}
                    className="w-full"
                  >
                    <Text className="text-primary-foreground font-semibold">
                      {loading || checkEmailExistsMutation.isPending ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </Button>
                </View>
              </Form>
              
              {/* Sign In Link */}
              <View className="flex-row justify-center items-center mt-6 mb-4">
                <Text className="text-muted-foreground text-sm">
                  Already have an account?
                </Text>
                <Button
                  onPress={() => router.replace('/auth/signin')}
                  variant="link"
                  className="p-0 h-auto ml-1"
                >
                  <Text className="text-primary text-sm font-medium">
                    Sign In
                  </Text>
                </Button>
              </View>
              
              {/* Terms */}
              <Muted className="text-center text-xs leading-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Muted>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
