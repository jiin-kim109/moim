import React from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Bell, BellOff } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import JoinedChatRoomList from '@components/JoinedChatRoomList';
import { useDebouncedFunction } from '@lib/utils';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useUpdateUserProfile } from '@hooks/useUpdateUserProfile';
import { usePushNotificationContext } from '@hooks/usePushNotificationToken';
import { toast } from 'sonner-native';



export default function ChatsScreen() {
  const router = useRouter();
  
  const { data: userProfile } = useGetCurrentUserProfile();
  const updateUserProfileMutation = useUpdateUserProfile();
  const { decrementBadgeCount } = usePushNotificationContext();

  const handleChatRoomPress = useDebouncedFunction(async (chatroomItem) => {
    if (chatroomItem.unread_count > 0) {
      await decrementBadgeCount(chatroomItem.unread_count);
    }
    router.push(`/chatroom/${chatroomItem.chatroom.id}`);
  });

  const handleProfilePress = useDebouncedFunction(() => {
    router.push('/chats/profile');
  });

  const handleNotificationPress = useDebouncedFunction(async () => {
    if (userProfile) {
      await updateUserProfileMutation.mutateAsync({
        notification_enabled: !userProfile.notification_enabled
      }).then(() => {
        if (userProfile.notification_enabled) {
          toast.info('Notification turned off', {
            description: 'You will not receive push notifications for new messages'
          });
        } else {
          toast.success('Notification turned on', {
            description: 'You will receive push notifications for new messages'
        }); 
      }});
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-5 pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-semibold text-gray-900">Chats</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity 
              onPress={handleNotificationPress} 
              className="p-2"
              disabled={updateUserProfileMutation.isPending}
            >
              {userProfile?.notification_enabled ? (
                <Bell size={28} color="#000" />
              ) : (
                <BellOff size={28} color="#666" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePress} className="p-2">
              <User size={32} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Chat List */}
      <JoinedChatRoomList 
        onChatRoomPress={handleChatRoomPress}
      />
    </SafeAreaView>
  );
} 