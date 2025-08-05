import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import supabase from '@lib/supabase';
import { fetchCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';

export default function SplashPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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

        const userProfile = await fetchCurrentUserProfile();
        if (userProfile && !userProfile.is_onboarded) {
          router.replace('/onboarding');
        } else {
          router.replace('/(main)/(tabs)/home');
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
  }, [router]);

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