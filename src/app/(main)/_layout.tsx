import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ChatMessageSubscriptionProvider, useChatMessageSubscriptionContext } from '@hooks/message/useChatMessageSubscription';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { AppState } from 'react-native';

function SubscriptionManager() {
  const { reconnect } = useChatMessageSubscriptionContext();
  const { isConnected } = useNetworkStatus();

  // reconnection listeners
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

  // Reconnect when network is restored
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