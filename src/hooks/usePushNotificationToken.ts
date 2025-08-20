import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import supabase from '../lib/supabase';

interface NotificationData {
  route?: string;
  [key: string]: any;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushNotificationError = {
  message: string;
  code?: string;
};

function handleNotificationNavigation(router: any, data: NotificationData, navigationDelay = 0) {
  if (data?.route && typeof data.route === 'string') {
    const navigateToRoute = () => {
      router.push(data.route);
    };

    setTimeout(navigateToRoute, navigationDelay);
  }
}

function setupNotificationListeners(
  router: any,
  notificationListener: { current: Notifications.EventSubscription | null },
  responseListener: { current: Notifications.EventSubscription | null }
) {
  // Handle notifications received while app is foregrounded
  notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    console.debug('Notification received when foregrounded:', notification);
  });

  // Handle notification responses (when user taps notification)
  responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    const body = response.notification.request.content as NotificationData;
    handleNotificationNavigation(router, body);
  });

  // Handle app launch from notification (cold start)
  Notifications.getLastNotificationResponseAsync().then(response => {
    if (response) {
      const body = response.notification.request.content as NotificationData;
      handleNotificationNavigation(router, body, 1000);
    }
  });
}

function cleanupNotificationListeners(
  notificationListener: { current: Notifications.EventSubscription | null },
  responseListener: { current: Notifications.EventSubscription | null }
) {
  if (notificationListener.current) {
    notificationListener.current.remove();
  }
  if (responseListener.current) {
    responseListener.current.remove();
  }
}

interface PushNotificationContextType {
  register: (userId: string) => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  decrementBadgeCount: (count: number) => Promise<void>;
  isLoading: boolean;
  error: PushNotificationError | null;
}

const PushNotificationContext = createContext<PushNotificationContextType | null>(null);

export const usePushNotificationContext = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotificationContext must be used within PushNotificationProvider');
  }
  return context;
};

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

export function PushNotificationProvider({ children }: PushNotificationProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PushNotificationError | null>(null);
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Set up notification listeners
  useEffect(() => {
    setupNotificationListeners(router, notificationListener, responseListener);

    return () => {
      cleanupNotificationListeners(notificationListener, responseListener);
    };
  }, [router]);

  const setBadgeCount = async (count: number): Promise<void> => {
    await Notifications.setBadgeCountAsync(count);
  };

  const decrementBadgeCount = async (count: number): Promise<void> => {
    const currentBadgeCount = await Notifications.getBadgeCountAsync();
    const newBadgeCount = Math.max(0, currentBadgeCount - count);
    await Notifications.setBadgeCountAsync(newBadgeCount);
  };

  const register = async (userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Setup Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'notification.wav',
        });
      }

      // 2. Request permissions
      let notificationStatus;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          }
        });
        notificationStatus = status;
      } else {
        notificationStatus = existingStatus;
      }
      
      if (notificationStatus !== 'granted') {
        console.debug('Push notification permissions not granted');
        return;
      }

      // 3. Get Expo push token
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      
      const pushToken = pushTokenData.data;
      console.debug('Expo push token obtained:', pushToken);

      // 4. Update user profile with push token
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({ push_notification_token: pushToken })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Failed to update push notification token: ${updateError.message}`);
      }

      console.debug('Push notification token registered successfully');

    } catch (err) {
      const error: PushNotificationError = {
        message: err instanceof Error ? err.message : 'Failed to setup push notifications',
        code: err instanceof Error && 'code' in err ? (err as any).code : undefined,
      };
      setError(error);
      console.error('Push notification registration failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    register,
    setBadgeCount,
    decrementBadgeCount,
    isLoading,
    error,
  };

  return React.createElement(
    PushNotificationContext.Provider,
    { value: contextValue },
    children
  );
}

