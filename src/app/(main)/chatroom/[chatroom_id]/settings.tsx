import React, { useRef } from 'react';
import { SafeAreaView, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import { useGetChatroom } from '@hooks/chats/useGetChatroom';
import { useDebouncedFunction } from '@lib/utils';
import ChatroomForm from '@components/ChatroomForm';

export default function ChatroomSettingsScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();
  const { data: chatroom } = useGetChatroom(chatroom_id as string);

  const routeBack = useDebouncedFunction(() => router.back());

  const submitRef = useRef<(() => void) | null>(null);
  const handleDone = () => {
    submitRef.current?.();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header (similar to create page) */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={routeBack}
          className="p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold text-gray-900 flex-1 text-center ml-5">
          Chatroom Settings
        </Text>

        <TouchableOpacity
          onPress={handleDone}
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
          mode="update"
          chatroomId={chatroom_id as string}
          defaultValues={chatroom ? {
            title: chatroom.title,
            description: chatroom.description,
            max_participants: chatroom.max_participants,
            thumbnail_url: chatroom.thumbnail_url,
            address: chatroom.address,
          } : undefined}
          disableLocationField
          onSubmitted={() => router.back()}
          onReady={(submit) => { submitRef.current = submit; }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


