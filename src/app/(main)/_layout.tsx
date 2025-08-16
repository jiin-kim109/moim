import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ChatMessageSubscriptionProvider, useChatMessageSubscriptionContext } from '@hooks/message/useChatMessageSubscription';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

function SubscriptionManager() {
  const { reconnect } = useChatMessageSubscriptionContext();
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        reconnect();
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, [reconnect]);

  useEffect(() => {
    if (isConnected === true) {
      reconnect();
    }
  }, [isConnected, reconnect]);

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