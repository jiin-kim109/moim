import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@components/ui/form';
import { useJoinChatroom } from '@hooks/chats/useJoinChatroom';

// Form schema for joining chatroom
const joinChatroomSchema = z.object({
  nickname: z
    .string()
    .min(1, 'Nickname is required')
    .max(20, 'Nickname must be at most 20 characters'),
});

type JoinChatroomFormValues = z.infer<typeof joinChatroomSchema>;

interface JoinChatroomFormProps {
  chatroomId: string;
  userId: string;
  onJoinSuccess?: () => void;
}

export default function JoinChatroomForm({ 
  chatroomId, 
  userId, 
  onJoinSuccess
}: JoinChatroomFormProps) {
  const [joinError, setJoinError] = useState<string>('');
  const joinChatroomMutation = useJoinChatroom();

  // Form for joining chatroom
  const joinForm = useForm<JoinChatroomFormValues>({
    resolver: zodResolver(joinChatroomSchema),
    defaultValues: {
      nickname: '',
    },
  });

  const handleJoinChatroom = async (data: JoinChatroomFormValues) => {
    if (!userId) return;

    setJoinError('');

    try {
      await joinChatroomMutation.mutateAsync({
        chatroom_id: chatroomId,
        user_id: userId,
        nickname: data.nickname.trim(),
      });

      joinForm.reset();
      onJoinSuccess?.();
    } catch (error: any) {
      if (error.isDuplicateNickname) {
        setJoinError('This nickname is already taken in this chatroom. Please choose another.');
        return;
      }
      console.error('Failed to join chatroom with nickname:', error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
        <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
          Set Your Nickname
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Choose a nickname to use in this chatroom
        </Text>
        
        <Form {...joinForm}>
          <View className="mb-4">
            <FormField
              control={joinForm.control}
              name="nickname"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      onChangeText={(text) => {
                        field.onChange(text);
                        // Clear error when user starts typing
                        if (joinError) {
                          setJoinError('');
                        }
                      }}
                      placeholder="Enter your nickname"
                      className={`bg-gray-50 border rounded-xl px-4 py-3 text-base ${
                        fieldState.error || joinError ? 'border-red-500' : 'border-gray-200'
                      }`}
                      maxLength={20}
                      error={!!fieldState.error || !!joinError}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                  {joinError && !fieldState.error && (
                    <Text className="text-red-500 text-sm mt-2 px-1">
                      {joinError}
                    </Text>
                  )}
                </FormItem>
              )}
            />
          </View>
          
          <Button
            onPress={joinForm.handleSubmit(handleJoinChatroom)}
            disabled={!joinForm.formState.isValid || joinChatroomMutation.isPending}
            className={`w-full py-3 rounded-xl ${
              joinForm.formState.isValid && !joinChatroomMutation.isPending
                ? 'bg-orange-500' 
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-white font-semibold text-base">
              Set Nickname
            </Text>
          </Button>
        </Form>
      </View>
    </View>
  );
} 