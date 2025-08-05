import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ChatMessageSubscriptionProvider, useChatMessageSubscriptionContext } from '@hooks/message/useChatMessageSubscription';
import { useGetJoinedChatrooms } from '@hooks/chats/useGetJoinedChatrooms';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';

function SubscriptionManager() {
  const { refreshSubscriptions } = useChatMessageSubscriptionContext();
  const { data: userProfile } = useGetCurrentUserProfile();
  const currentUserId = userProfile?.id;

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