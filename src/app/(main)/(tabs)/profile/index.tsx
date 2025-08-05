import React, { useState, useEffect } from 'react';
import { View, Alert, SafeAreaView, TouchableOpacity, ActionSheetIOS, Platform } from 'react-native';
import { Menu, MapPin, Settings } from 'lucide-react-native';
import supabase from '@lib/supabase';
import { Text } from '@components/ui/text';
import { Skeleton } from '@components/ui/skeleton';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import UserProfileImageUpload from '@components/UserProfileImageUpload';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useUpdateUserProfile } from '@hooks/useUpdateUserProfile';
import { FileHolder } from '@lib/objectstore';

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  
  const { data: userProfile } = useGetCurrentUserProfile();
  const updateUserMutation = useUpdateUserProfile();
  const [profileImageUri, setProfileImageUri] = useState<string | null>(userProfile?.profile_image_url || null);

  // on trigger after userProfile is loaded
  useEffect(() => {
    setProfileImageUri(userProfile?.profile_image_url || null);
  }, [userProfile?.profile_image_url]);

  const handleProfileImageChange = async (fileHolder: FileHolder | null) => {
    try {
      if (fileHolder) {
        setProfileImageUri(fileHolder.uri);
      } else {
        setProfileImageUri(null);
      }
      
      await updateUserMutation.mutateAsync({ 
        profile_image_file: fileHolder 
      });
    } catch (error) {
      console.error('Failed to update profile image:', error);
      Alert.alert('Error', 'Failed to update profile image. Please try again later.');
      setProfileImageUri(userProfile?.profile_image_url || null);
    }
  };

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
      // Navigate back to root
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

  const showNativeMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Sign Out', 'Delete Account'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleSignOut();
          } else if (buttonIndex === 2) {
            handleDeleteAccount();
          }
        }
      );
    } else {
      // For Android, use Alert as fallback
      Alert.alert(
        'Account Settings',
        'Choose an option',
        [
          {
            text: 'Sign Out',
            onPress: handleSignOut,
          },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: handleDeleteAccount,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleSettingsMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Update Current Location', 'Notification Settings'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            router.push('/profile/update_location');
          } else if (buttonIndex === 2) {
            // TODO: Navigate to notification settings
            Alert.alert('Notification Settings', 'Notification settings feature coming soon');
          }
        }
      );
    } else {
      // For Android, use Alert as fallback
      Alert.alert(
        'Settings',
        'Choose an option',
        [
          {
            text: 'Update Current Location',
            onPress: () => router.push('/profile/update_location'),
          },
          {
            text: 'Notification Settings',
            onPress: () => Alert.alert('Notification Settings', 'Notification settings feature coming soon'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-5 pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-gray-900">Profile</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={showNativeMenu} className="p-2">
              <Menu size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSettingsMenu} className="p-2">
              <Settings size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-1 p-6">
        {session?.user ? (
          <View className="flex-1 justify-between">
            <View className="space-y-6">
              {/* Profile Image Upload */}
              <View className="items-center mb-6">
                <UserProfileImageUpload
                  value={profileImageUri}
                  onImageChange={handleProfileImageChange}
                  size="large"
                />
              </View>

              {/* User Information */}
              <View className="space-y-4 gap-6">
                <View className="space-y-2">
                  <Text className="text-lg text-bold text-gray-900 mb-1">Email</Text>
                  <Text className="text-gray-600">{session.user.email}</Text>
                </View>
                
                {userProfile?.address && (
                  <View className="space-y-2">
                    <Text className="text-lg text-bold text-gray-900 mb-1">Location</Text>
                    <View className="flex-row items-center gap-2">
                      <MapPin size={16} color="#6B7280" />
                      <Text className="text-gray-600">
                        {userProfile.address.place_name || userProfile.address.city || 'No location set'}
                      </Text>
                    </View>
                  </View>
                )}
                

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