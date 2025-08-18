import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import supabase from '@lib/supabase';
import { prefetchCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { prefetchRecommendedChatrooms } from '@hooks/chats/useGetRecommendedChatrooms';
import { prefetchJoinedChatrooms } from '@hooks/chats/useGetJoinedChatrooms';
import { ChatRoom, UserProfile } from '@hooks/types';
import { prefetchLatestChatroomMessage } from '@hooks/message/useGetLatestChatroomMessages';
import { prefetchUnreadChatroomMessageCount } from '@hooks/chats/useGetUnreadChatroomMessageCount';
import { prefetchChatroomParticipants } from '@hooks/chats/useGetChatroomParticipants';
import { prefetchChatMessages } from '@hooks/message/useGetChatMessages';
import { prefetchChatroom } from '@hooks/chats/useGetChatroom';
import { usePushNotificationToken } from '@hooks/usePushNotificationToken';
import SplashScreen from '@components/Splash';

export default function SplashPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const { register: registerPushNotification } = usePushNotificationToken();

  async function initializeApp(userId: string): Promise<UserProfile | null> {
    await prefetchJoinedChatrooms(queryClient, userId);

    const joinedChatrooms = await queryClient.getQueryData(["joinedChatrooms"]) as ChatRoom[];
    
    const prefetchPromises = joinedChatrooms.reduce((acc: Promise<void>[], chatroom) => {
      const chatroomId = chatroom.id;
      return [
        prefetchChatroom(queryClient, chatroomId),
        prefetchLatestChatroomMessage(queryClient, chatroomId),
        prefetchUnreadChatroomMessageCount(queryClient, chatroomId, userId),
        prefetchChatroomParticipants(queryClient, chatroomId),
        prefetchChatMessages(queryClient, chatroomId),
        ...acc,
      ];
    }, []);

    await Promise.all([
      ...prefetchPromises,
      prefetchRecommendedChatrooms(queryClient, userId),
      prefetchCurrentUserProfile(queryClient),
      registerPushNotification(userId),
    ]);

    return await queryClient.getQueryData(["userProfile"]) as UserProfile;
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!session) {
          router.replace('/auth/signin');
          return;
        }

        const userProfile = await initializeApp(session.user.id);
        if (!mounted) return;

        if (userProfile && !userProfile.is_onboarded) {
          router.replace('/onboarding');
        } else {
          router.replace('/chats');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/auth/signin');
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, queryClient]);

  if (!isLoading) {
    return null;
  }
  
  return <SplashScreen />;
} 