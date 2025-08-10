import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import supabase from '@lib/supabase';
import { fetchCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { UserProfile } from '@hooks/types';
import { prefetchRecommendedChatrooms } from '@hooks/chats/useGetRecommendedChatrooms';
import { prefetchJoinedChatrooms, JOINED_CHATROOMS_QUERY_KEY } from '@hooks/chats/useGetJoinedChatrooms';
import { prefetchUnreadChatroomMessageCount } from '@hooks/message/useGetUnreadChatroomMessageCount';
import { prefetchChatroomParticipants } from '@hooks/chats/useGetChatroomParticipants';
import { prefetchChatMessages } from '@hooks/message/useGetChatMessages';

export default function SplashPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  async function initializeApp(userId: string): Promise<UserProfile | null> {
    await Promise.all([
      prefetchRecommendedChatrooms(queryClient, userId),
      prefetchJoinedChatrooms(queryClient, userId),
    ]);

    const joinedChatrooms = queryClient.getQueryData(JOINED_CHATROOMS_QUERY_KEY) as any[];

    if (joinedChatrooms && joinedChatrooms.length > 0) {
      const prefetchPromises = joinedChatrooms.map(async (chatroom) => {
        const chatroomId = chatroom.id;
        return Promise.all([
          prefetchUnreadChatroomMessageCount(queryClient, chatroomId, userId),
          prefetchChatroomParticipants(queryClient, chatroomId),
          prefetchChatMessages(queryClient, chatroomId),
        ]);
      });
      await Promise.all(prefetchPromises);
    }

    return await fetchCurrentUserProfile();
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
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moim</Text>
      <Text style={styles.subtitle}>Connecting Communities</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.9,
  },
}); 