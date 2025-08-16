import React from 'react';
import { View, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { User, ChevronLeft, UserPlus } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar';
import { useGetBannedUsers } from '@hooks/chats/useGetBannedUsers';
import { useUnbanUserFromChatroom } from '@hooks/chats/useBanUserFromChatroom';

interface BannedUserItemProps {
  bannedUser: any;
  onUnban: (bannedUser: any) => void;
}

function BannedUserItem({ bannedUser, onUnban }: BannedUserItemProps) {
  return (
    <View className="flex-row items-center py-3 px-6 relative">
      <Avatar className="w-12 h-12 mr-3 !rounded-2xl" alt={bannedUser.nickname || 'User'}>
        {bannedUser.profile_image_url ? (
          <AvatarImage source={{ uri: bannedUser.profile_image_url }} />
        ) : (
          <AvatarFallback className="bg-gray-100 !rounded-2xl">
            <User size={16} color="#9CA3AF" />
          </AvatarFallback>
        )}
      </Avatar>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">
          {bannedUser.nickname}
        </Text>
        <Text className="text-sm text-gray-500">
          Banned on {new Date(bannedUser.banned_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onUnban(bannedUser)}
        className="p-2 -mr-2"
      >
        <UserPlus size={20} color="#10B981" />
      </TouchableOpacity>
    </View>
  );
}

export default function BannedUsersScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();
  
  const { data: bannedUsers } = useGetBannedUsers(chatroom_id as string);
  const unbanUserMutation = useUnbanUserFromChatroom();

  const handleUnbanUser = (bannedUser: any) => {
    unbanUserMutation.mutate({
      chatroom_id: chatroom_id as string,
      user_id: bannedUser.user_id,
    });
  };

  const renderBannedUser = ({ item }: { item: any }) => {
    return (
      <BannedUserItem 
        bannedUser={item}
        onUnban={handleUnbanUser}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between py-4 px-6 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Banned ({bannedUsers?.length || 0})
        </Text>
        <View className="w-10" />
      </View>

      {/* Banned Users List */}
      <View className="flex-1">
        {bannedUsers && bannedUsers.length > 0 ? (
          <FlatList
            data={bannedUsers}
            renderItem={renderBannedUser}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-gray-50 rounded-lg p-8 w-full">
              <Text className="text-gray-500 text-center text-lg mb-2">
                No banned users
              </Text>
              <Text className="text-gray-400 text-center text-sm">
                Users you ban will appear here
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
} 