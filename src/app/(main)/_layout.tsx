import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ChatMessageSubscriptionProvider, useChatMessageSubscriptionContext } from '@hooks/chats/useChatMessageSubscription';
import { useGetJoinedChatrooms } from '@hooks/chats/useGetJoinedChatrooms';
import supabase from '@lib/supabase';

function SubscriptionManager() {
  const { refreshSubscriptions } = useChatMessageSubscriptionContext();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: joinedChatrooms } = useGetJoinedChatrooms(currentUserId || '', {
    enabled: !!currentUserId,
  });

  useEffect(() => {
    if (joinedChatrooms && joinedChatrooms.length > 0) {
      const chatroomIds = joinedChatrooms.map(chatroom => chatroom.id);
      refreshSubscriptions(chatroomIds);
    }
  }, [joinedChatrooms, refreshSubscriptions]);

  return null;
}

export default function MainLayout() {
  return (
    <ChatMessageSubscriptionProvider>
      <SubscriptionManager />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chatroom" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </ChatMessageSubscriptionProvider>
  );
}