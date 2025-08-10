import React from 'react';
import { View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@components/ui/form';
import { useUpdateNickname } from '@hooks/chats/useUpdateNickname';
import { useGetChatroomParticipants } from '@hooks/chats/useGetChatroomParticipants';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useDebouncedFunction } from '@lib/utils';

// Form schema for changing nickname
const changeNicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, 'Nickname is required')
    .max(20, 'Nickname must be at most 20 characters'),
});

type ChangeNicknameFormValues = z.infer<typeof changeNicknameSchema>;

export default function ChangeNicknameScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();
  
  const { data: currentUser } = useGetCurrentUserProfile();
  const { data: participants } = useGetChatroomParticipants(chatroom_id as string);
  const updateNicknameMutation = useUpdateNickname();

  // Get current user's nickname
  const currentParticipant = participants?.find(p => p.user_id === currentUser?.id);
  const currentNickname = currentParticipant?.nickname || '';

  // Form for changing nickname
  const form = useForm<ChangeNicknameFormValues>({
    resolver: zodResolver(changeNicknameSchema),
    defaultValues: {
      nickname: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!currentUser?.id || !chatroom_id) {
      Alert.alert('Error', 'Unable to update nickname. Please try again.');
      return;
    }

    if (data.nickname.trim() === currentNickname) {
      Alert.alert('No Changes', 'The nickname is the same as your current one.');
      return;
    }

    try {
      await updateNicknameMutation.mutateAsync({
        chatroom_id: chatroom_id as string,
        user_id: currentUser.id,
        nickname: data.nickname.trim(),
      });
      
      router.back();
    } catch (error: any) {
      if (error.isDuplicateNickname) {
        Alert.alert(
          'Nickname Already Taken',
          'This nickname is already in use in this chatroom. Please choose a different one.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to update nickname. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    }
  });

  // Pre-create debounced handlers to avoid changing hook order during render
  const handleBackPress = useDebouncedFunction(() => router.back());
  const handleDonePress = useDebouncedFunction(handleSubmit);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={handleBackPress}
          className="p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        
        <Text className="text-xl font-semibold text-gray-900 flex-1 text-center ml-5">
          Change Nickname
        </Text>
        
        <TouchableOpacity
          onPress={handleDonePress}
          disabled={updateNicknameMutation.isPending || !form.formState.isValid}
          className="p-2"
        >
          <Text className={`font-semibold text-xl ${
            updateNicknameMutation.isPending || !form.formState.isValid ? 'text-gray-400' : 'text-orange-500'
          }`}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-6">
        {/* Current Nickname Display */}
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-2">Current Nickname</Text>
          <View className="bg-gray-50 rounded-lg px-4 py-3">
            <Text className="text-lg text-gray-900">{currentNickname || 'No nickname set'}</Text>
          </View>
        </View>

        {/* New Nickname Input */}
        <Form {...form}>
          <View className="mb-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Text className="text-sm text-gray-500 mb-2">New Nickname</Text>
                  <FormControl>
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Enter new nickname"
                      className="text-lg"
                      autoFocus
                      maxLength={20}
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  <Text className="text-xs text-gray-400 mt-2">
                    {field.value.length}/20 characters
                  </Text>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </View>
        </Form>

        {/* Info Text */}
        <View className="bg-blue-50 rounded-lg p-4">
          <Text className="text-sm text-blue-700">
            Your nickname will be visible to other participants in this chatroom. 
            You can change it anytime.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 