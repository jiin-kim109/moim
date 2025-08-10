import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { User, ChevronLeft, MoreVertical, UserMinus, Ban, Edit, Shield, Crown, LogOut } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar';
import { useGetChatroomParticipants } from '@hooks/chats/useGetChatroomParticipants';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useGetChatroom } from '@hooks/chats/useGetChatroom';
import { useGetBannedUsers } from '@hooks/chats/useGetBannedUsers';
import { useKickUserFromChatroom } from '@hooks/chats/useKickUserFromChatroom';
import { useBanUserFromChatroom, useUnbanUserFromChatroom } from '@hooks/chats/useBanUserFromChatroom';
import { useTransferHost } from '@hooks/chats/useTransferHost';
import { ChatRoomParticipant } from '@hooks/types';
import { useExitChatroom } from '@hooks/chats/useExitChatroom';

interface ParticipantItemProps {
  participant: ChatRoomParticipant;
  isCurrentUser: boolean;
  isHost: boolean;
  hostId: string;
  onActionPress: (participant: ChatRoomParticipant) => void;
}

function ParticipantItem({ participant, isCurrentUser, isHost, hostId, onActionPress }: ParticipantItemProps) {
  const showActionButton = isCurrentUser || isHost;

  const handleButtonPress = () => {
    onActionPress(participant);
  };

  return (
    <View className="flex-row items-center py-3 px-6 relative">
      <Avatar className="w-12 h-12 mr-3 !rounded-2xl" alt={participant.nickname || 'User'}>
        {participant.user?.profile_image_url ? (
          <AvatarImage source={{ uri: participant.user.profile_image_url }} />
        ) : (
          <AvatarFallback className="bg-gray-100 !rounded-2xl">
            <User size={16} color="#9CA3AF" />
          </AvatarFallback>
        )}
      </Avatar>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-medium text-gray-900">
            {participant.nickname || participant.user?.username || 'Unknown User'}
          </Text>
          {participant.user_id === hostId && (
            <Crown size={16} color="#F59E0B" />
          )}
        </View>
      </View>
      {showActionButton && (
        <TouchableOpacity
          onPress={handleButtonPress}
          className="p-2 -mr-2"
        >
          <MoreVertical size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ChatroomParticipantsMenuScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();
  
  const [selectedParticipant, setSelectedParticipant] = useState<ChatRoomParticipant | null>(null);
  
  // Bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const { data: chatroom } = useGetChatroom(chatroom_id as string);
  const { data: participants } = useGetChatroomParticipants(chatroom_id as string);
  const { data: bannedUsers } = useGetBannedUsers(chatroom_id as string);
  const { data: currentUser } = useGetCurrentUserProfile();
  const currentUserId = currentUser?.id;
  const hostId = chatroom?.host_id || '';

  // Mutations
  const kickUserMutation = useKickUserFromChatroom();

  const banUserMutation = useBanUserFromChatroom();

  const unbanUserMutation = useUnbanUserFromChatroom();

  const transferHostMutation = useTransferHost();
  const exitChatroomMutation = useExitChatroom();

  const handleParticipantActionPress = useCallback((participant: ChatRoomParticipant) => {
    // If a different participant is already selected, close first then reopen
    if (selectedParticipant && selectedParticipant.user_id !== participant.user_id) {
      bottomSheetRef.current?.close();
      // Add a small delay to ensure the sheet closes before reopening
      setTimeout(() => {
        setSelectedParticipant(participant);
        bottomSheetRef.current?.expand();
      }, 300);
    } else {
      setSelectedParticipant(participant);
      bottomSheetRef.current?.expand();
    }
  }, [selectedParticipant]);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedParticipant(null);
  }, []);

  // Action handlers
  const handleKickUser = useCallback(() => {
    if (!selectedParticipant) return;

    const nickname = selectedParticipant.nickname;
    
    Alert.alert(
      'Kick User',
      `Are you sure you want to kick "${nickname}" from this chatroom?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Kick ${nickname}`,
          style: 'destructive',
          onPress: () => {
            kickUserMutation.mutate({
              chatroom_id: chatroom_id as string,
              user_id: selectedParticipant.user_id,
            });
            handleCloseBottomSheet();
          },
        },
      ]
    );
  }, [selectedParticipant, kickUserMutation, chatroom_id, handleCloseBottomSheet]);

  const handleBanUser = useCallback(() => {
    if (!selectedParticipant) return;

    const nickname = selectedParticipant.nickname;
    
    Alert.alert(
      'Ban User',
      `Are you sure you want to ban "${nickname}" from this chatroom? They will not be able to rejoin.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Ban ${nickname}`,
          style: 'destructive',
          onPress: () => {
            banUserMutation.mutate({
              chatroom_id: chatroom_id as string,
              user_id: selectedParticipant.user_id,
            });
            handleCloseBottomSheet();
          },
        },
      ]
    );
  }, [selectedParticipant, banUserMutation, chatroom_id, handleCloseBottomSheet]);

  const handleUnbanUser = useCallback((bannedUser: any) => {
    unbanUserMutation.mutate({
      chatroom_id: chatroom_id as string,
      user_id: bannedUser.user_id,
    });
  }, [unbanUserMutation, chatroom_id]);

  const handleChangeNickname = useCallback(() => {
    handleCloseBottomSheet();
    router.push(`/chatroom/${chatroom_id}/nickname`);
  }, [handleCloseBottomSheet, router, chatroom_id]);

  const handleTransferHost = useCallback(() => {
    if (!selectedParticipant) return;

    const nickname = selectedParticipant.nickname;
    
    Alert.alert(
      'Transfer Host',
      `Are you sure you want to transfer host to "${nickname}"? You will no longer be the host of this chatroom.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Transfer to ${nickname}`,
          style: 'default',
          onPress: () => {
            transferHostMutation.mutate({
              chatroom_id: chatroom_id as string,
              new_host_id: selectedParticipant.user_id,
            });
            handleCloseBottomSheet();
          },
        },
      ]
    );
  }, [selectedParticipant, transferHostMutation, chatroom_id, handleCloseBottomSheet]);

  const renderParticipant = ({ item }: { item: ChatRoomParticipant }) => {
    const isCurrentUser = item.user_id === currentUserId;
    const isHost = currentUserId === hostId;
    
    return (
      <ParticipantItem 
        participant={item} 
        isCurrentUser={isCurrentUser}
        isHost={isHost}
        hostId={hostId}
        onActionPress={handleParticipantActionPress}
      />
    );
  };

  const handleExitChatroom = useCallback(() => {
    Alert.alert(
      'Exit Chatroom',
      'Are you sure you want to leave this chatroom?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            try {
              await exitChatroomMutation.mutateAsync({ chatroom_id: chatroom_id as string });
              router.replace('/chats');
            } catch (_e) {
              router.replace('/chats');
            }
          },
        },
      ]
    );
  }, [exitChatroomMutation, chatroom_id, router, currentUserId, hostId]);

  return (
    <GestureHandlerRootView className="flex-1 bg-white">
      <TouchableOpacity onPress={handleCloseBottomSheet} activeOpacity={1} className="flex-1">
        <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4 px-6 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Participants ({participants?.length || 0})
          </Text>
          <View className="w-10" />
        </View>

        {/* Banned Users Button - Only for host and when there are banned users */}
        {currentUserId === hostId && bannedUsers && bannedUsers.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push(`/chatroom/${chatroom_id}/banned`)}
            className="mx-4 my-4 px-4 py-4 rounded-lg border border-gray-200"
          >
            <Text className="text-base text-gray-700">
              Banned ({bannedUsers.length})
            </Text>
          </TouchableOpacity>
        )}

        {/* Participants List */}
        <View className="flex-1 mt-2 mb-4">
          <FlatList
            data={React.useMemo(() => {
              if (!participants || !currentUserId) return participants || [];
              
              return [...participants].sort((a, b) => {
                // Current user always first
                if (a.user_id === currentUserId) return -1;
                if (b.user_id === currentUserId) return 1;
                // Host second
                if (a.user_id === hostId) return -1;
                if (b.user_id === hostId) return 1;
                
                return 0;
              });
            }, [participants, currentUserId, hostId])}
            bounces={false}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.user_id}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        </View>
        {/* Exit Chatroom Button */}
        <View className="px-6 pb-6">
          <Button
            onPress={handleExitChatroom}
            variant="outline"
            className="w-full border-red-300"
          >
            <View className="flex-row items-center justify-center gap-2">
              <LogOut size={18} color="#DC2626" />
              <Text className="text-red-600 font-medium">Exit chatroom</Text>
            </View>
          </Button>
        </View>
        </SafeAreaView>
      </TouchableOpacity>

      {/* Bottom Sheet for Participant Actions */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: 'white' }}
      >
        <BottomSheetView className="flex-1 px-4 pt-1 pb-16">
          <View className="flex-1">
            {/* Header */}
            <View className="mb-6">
              {selectedParticipant && (
                <View className="flex-row items-center py-3 px-3">
                  <Avatar className="w-14 h-14 mr-3 !rounded-2xl" alt={selectedParticipant.nickname || 'User'}>
                    {selectedParticipant.user?.profile_image_url ? (
                      <AvatarImage source={{ uri: selectedParticipant.user.profile_image_url }} />
                    ) : (
                      <AvatarFallback className="bg-gray-100 !rounded-2xl">
                        <User size={16} color="#9CA3AF" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <View className="flex-1">
                    <Text className="text-lg font-medium text-gray-900">
                      {selectedParticipant.nickname || selectedParticipant.user?.username || 'Unknown User'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

                        {/* Action Buttons */}
            <View className="gap-4">
              {/* Change Nickname Button - Only for current user */}
              {selectedParticipant && selectedParticipant.user_id === currentUserId && (
                <Button
                  onPress={handleChangeNickname}
                  variant="outline"
                  className="w-full"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Edit size={18} color="#374151" />
                    <Text className="text-gray-700 font-medium">Change Nickname</Text>
                  </View>
                </Button>
              )}

              {/* Host Actions - Only for host and not for themselves */}
              {currentUserId === hostId && selectedParticipant && selectedParticipant.user_id !== currentUserId && (
                <>
                  {/* Transfer Host Button */}
                  <Button
                    onPress={handleTransferHost}
                    variant="outline"
                    className="w-full"
                    disabled={transferHostMutation.isPending}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Crown size={18} color="#374151" />
                      <Text className="text-gray-700 font-medium">
                        {transferHostMutation.isPending ? 'Transferring...' : 'Transfer Host'}
                      </Text>
                    </View>
                  </Button>

                  {/* Kick User Button */}
                  <Button
                    onPress={handleKickUser}
                    variant="destructive"
                    className="w-full"
                    disabled={kickUserMutation.isPending}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <UserMinus size={18} color="white" />
                      <Text className="text-white font-medium">
                        {kickUserMutation.isPending ? 'Kicking...' : 'Kick User'}
                      </Text>
                    </View>
                  </Button>

                  {/* Ban User Button */}
                  <Button
                    onPress={handleBanUser}
                    variant="destructive"
                    className="w-full"
                    disabled={banUserMutation.isPending}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                    <Ban size={18} color="white" />
                      <Text className="text-white font-medium">
                        {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
                      </Text>
                    </View>
                  </Button>
                </>
              )}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}