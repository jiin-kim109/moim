import React, { useState, useEffect } from 'react';
import { View, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { User, X } from 'lucide-react-native';
import supabase from '@lib/supabase';
import { Text } from '@components/ui/text';
import { Skeleton } from '@components/ui/skeleton';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { Button } from '@components/ui/button';

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  
  const { data: userProfile } = useGetCurrentUserProfile();

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        Alert.alert('Sign Out Error', error.message);
      }
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Sign Out Error', 'An unexpected error occurred');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.admin.deleteUser(
                session?.user?.id || ''
              );
              
              if (error) {
                Alert.alert('Delete Account Error', error.message);
                return;
              }
              
              router.replace('/auth/signin');
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Delete Account Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };



  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-5 pb-2">
        <View className="flex-row items-center justify-end">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 p-6">
        {session?.user ? (
          <View className="flex-1">
            <View className="space-y-6">
              {/* User Icon */}
              <View className="items-center mb-4">
                <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center">
                  <User size={48} color="#6B7280" />
                </View>
              </View>

              {/* User Information */}
              <View className="space-y-2 justify-center items-center">
                <Text className="text-gray-600">{session.user.email}</Text>
              </View>

              {/* Action Buttons */}
              <View className="gap-4 mt-16">
                <Button
                  onPress={handleSignOut}
                  variant="outline"
                  className="w-full"
                >
                  <Text className="text-gray-700 font-medium">Sign Out</Text>
                </Button>
                
                <Button
                  onPress={handleDeleteAccount}
                  variant="destructive"
                  className="w-full"
                >
                  <Text className="text-white font-medium">Delete Account</Text>
                </Button>
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1">
            <View className="space-y-6">
              {/* Profile Image Skeleton */}
              <View className="items-center mb-8">
                <Skeleton className="w-24 h-24 rounded-full" />
              </View>

              {/* Simple horizontal bars for profile fields */}
              <View className="space-y-4">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-5/6 h-4" />
                <Skeleton className="w-2/3 h-4" />
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
} 