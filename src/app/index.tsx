import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import supabase from '@lib/supabase';
import { fetchUserProfile } from '@hooks/useGetUserProfile';

export default function SplashPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const handleUserNavigation = async (session: any) => {
    if (!session) {
      router.replace('/auth/signin');
      return;
    }

    const userProfile = await fetchUserProfile(session.user.id);
      
    if (userProfile && !userProfile.is_onboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/main');
    }
  };
  
  useEffect(() => {
    let mounted = true;

    const checkAuthSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
        }

        if (!mounted) return;

        await handleUserNavigation(session);
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/auth/signin');
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.debug('Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN') {
          await handleUserNavigation(session);
        } else if (event === 'SIGNED_OUT') {
          router.replace('/auth/signin');
        }
      }
    );

    checkAuthSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
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