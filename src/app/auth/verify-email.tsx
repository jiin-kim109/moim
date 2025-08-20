import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import supabase from '@lib/supabase';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { P, Muted } from '@components/ui/typography';
import { toast } from 'sonner-native';
import { useCheckUserVerified } from '@hooks/useCheckEmailExists';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkUserVerifiedMutation = useCheckUserVerified();

  const handleCheckVerification = async () => {
    setLoading(true);
    setAuthError(null);
    
    const isVerified = await checkUserVerifiedMutation.mutateAsync(email || '');
      
    if (isVerified) {
      toast.success('Email verified successfully!', {
        description: 'You can now sign in to your account'
      });
      router.replace('/auth/signin');
    } else {
      setAuthError('Email not verified yet. Please check your email and click the verification link.');
    }
    setLoading(false);
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setAuthError(null);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email || '',
    });

    if (error) {
      setAuthError(error.message);
      setResendLoading(false);
      return;
    }

    toast.info('Verification email sent!', {
      description: 'Check your email for the verification link'
    });
    setResendLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-8">
        <View className="w-full max-w-sm mx-auto">
          {/* Header */}
          <View className="items-center mb-8">
            <P className="text-center text-muted-foreground mb-2">
              We've sent a verification link to
            </P>
            <Text className="text-center font-medium text-primary mb-6">
              {email}
            </Text>
            <P className="text-center text-muted-foreground">
              Click the link in your email to verify your account.
            </P>
          </View>
          
          {/* Global Auth Error */}
          {authError && (
            <View className="bg-destructive/10 border border-destructive rounded-md p-3 mb-6">
              <Text className="text-destructive text-sm">{authError}</Text>
            </View>
          )}
          
          {/* Action Buttons */}
          <View className="gap-y-4">
            <Button
              onPress={handleCheckVerification}
              disabled={loading || checkUserVerifiedMutation.isPending}
              className="w-full"
            >
              <Text className="text-primary-foreground font-semibold">
                {loading || checkUserVerifiedMutation.isPending ? 'Checking...' : 'I\'ve Verified My Email'}
              </Text>
            </Button>
            
            {/* Resend Email */}
            <Button
              onPress={handleResendEmail}
              disabled={resendLoading}
              variant="outline"
              className="w-full"
            >
              <Text className="font-medium">
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </Text>
            </Button>
          </View>
          
          {/* Back to Sign Up */}
          <View className="flex-row justify-center items-center mt-6 mb-4">
            <Text className="text-muted-foreground text-sm">
              Wrong email?
            </Text>
            <Button
              onPress={() => router.replace('/auth/signup')}
              variant="link"
              className="p-0 h-auto ml-1"
            >
              <Text className="text-primary text-sm font-medium">
                Go Back
              </Text>
            </Button>
          </View>
          
          {/* Help Text */}
          <Muted className="text-center text-xs leading-4">
            Check your spam folder if you don't see the email. The verification link expires in 24 hours.
          </Muted>
        </View>
      </View>
    </SafeAreaView>
  );
}
