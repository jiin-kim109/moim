import React from 'react';
import { SafeAreaView, View, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import ChatroomForm from '@components/ChatroomForm';
import { useCreateChatroom } from '@hooks/chats/useCreateChatroom';
import { useGetJoinedChatrooms } from '@hooks/chats/useGetJoinedChatrooms';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useDebouncedFunction } from '@lib/utils';


export default function CreateChatroomScreen() {
  const router = useRouter();
  const createChatroomMutation = useCreateChatroom();
  const { data: userProfile } = useGetCurrentUserProfile();
  const currentUserId = userProfile?.id;

  // Get joined chatrooms to check hosting limit
  const { data: joinedChatrooms } = useGetJoinedChatrooms(currentUserId || '', {
    enabled: !!currentUserId,
  });

  const submitRef = React.useRef<(() => void) | null>(null);
  const handleSubmit = async () => {
    if (!currentUserId) {
      console.error('User not authenticated');
      return;
    }

    // Check if user is already hosting 10 chatrooms
    const hostedChatroomsCount = joinedChatrooms?.filter(chatroom => 
      chatroom.host_id === currentUserId
    ).length || 0;

    if (hostedChatroomsCount >= 10) {
      Alert.alert(
        'Chatroom Limit Reached',
        'You can only host up to 10 chatrooms at a time. Please delete one of your existing chatrooms.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Trigger ChatroomForm submit; errors will be handled inside form submit
    submitRef.current?.();
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={useDebouncedFunction(() => router.back())}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          
          <Text className="text-xl font-semibold text-gray-900 flex-1 text-center ml-5">
            Create Chatroom
          </Text>
          
          <TouchableOpacity
            onPress={useDebouncedFunction(handleSubmit)}
            className="p-2"
          >
            <Text className="font-semibold text-xl text-orange-500">
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ChatroomForm
            mode="create"
            defaultValues={{}}
            onSubmitted={(newChatroom) => {
              router.replace('/chats');
              router.push(`/chatroom/${newChatroom.id}`);
            }}
            onReady={(submit) => { submitRef.current = submit; }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
