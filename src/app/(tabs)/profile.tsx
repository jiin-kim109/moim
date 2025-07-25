import React, { useState, useEffect } from 'react';
import { View, Alert, SafeAreaView } from 'react-native';
import supabase from '@lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { H2, P } from '@components/ui/typography';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        Alert.alert('Sign Out Error', error.message);
      }
      // Navigate back to root
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Sign Out Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <H2>Profile</H2>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {session?.user ? (
              <>
                <View className="space-y-2">
                  <P className="font-medium">Email:</P>
                  <Text className="text-muted-foreground">{session.user.email}</Text>
                </View>
                
                <View className="space-y-2">
                  <P className="font-medium">User ID:</P>
                  <Text className="text-muted-foreground text-xs">{session.user.id}</Text>
                </View>
                
                <Button
                  onPress={handleSignOut}
                  disabled={loading}
                  variant="destructive"
                  className="w-full mt-6"
                >
                  <Text className="text-white font-semibold">
                    {loading ? 'Signing out...' : 'Sign Out'}
                  </Text>
                </Button>
              </>
            ) : (
              <P className="text-center text-muted-foreground">
                No user session found
              </P>
            )}
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
} 