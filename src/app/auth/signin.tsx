import React, { useState } from 'react';
import { View, SafeAreaView, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
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

const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailSignIn = async (values: SignInFormValues) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }
      
      router.replace('/');
    } catch (error) {
      console.error('Email sign-in error:', error);
      setAuthError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'moim://auth/callback',
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setAuthError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
              </View>
              
              {/* Email/Password Form */}
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
                      <FormItem className="mb-6">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Enter your password"
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
                    onPress={form.handleSubmit(handleEmailSignIn)}
                    disabled={loading}
                    className="w-full"
                  >
                    <Text className="text-primary-foreground font-semibold">
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </Button>
                </View>
              </Form>
              
              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-muted-foreground text-sm mx-4">or</Text>
                <View className="flex-1 h-px bg-border" />
              </View>
              
              {/* Google Sign In */}
              <View className="mb-8">
                <Button
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="w-full flex-row items-center justify-center"
                >
                  <Image 
                    source={require('@assets/oauth-google-icon.png')}
                    className="w-8 h-8 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="font-semibold">
                    Continue with Google
                  </Text>
                </Button>
              </View>
              
              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center mb-4">
                <Text className="text-muted-foreground text-sm">
                  Don't have an account?
                </Text>
                <Button
                  onPress={() => router.replace('/auth/signup')}
                  variant="link"
                  className="p-0 h-auto ml-1"
                >
                  <Text className="text-primary text-sm font-medium">
                    Sign Up
                  </Text>
                </Button>
              </View>
              
              {/* Terms */}
              <Muted className="text-center text-xs leading-4">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Muted>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
} 