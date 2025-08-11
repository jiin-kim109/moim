import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ChatMessageSubscriptionProvider, useChatMessageSubscriptionContext } from '@hooks/message/useChatMessageSubscription';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';

function SubscriptionManager() {
  const { reconnect } = useChatMessageSubscriptionContext();

  // reconnection listeners (foreground + network restore)
  useEffect(() => {
    const onAppStateChange = (state: string) => {
      if (state === 'active') {
        reconnect();
      }
    };
    const appStateSub = AppState.addEventListener('change', onAppStateChange);

    const netUnsub = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        reconnect();
      }
    });

    return () => {
      appStateSub.remove();
      netUnsub();
    };
  }, [reconnect]);

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