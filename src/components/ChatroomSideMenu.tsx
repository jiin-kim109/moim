import React, { useState } from 'react';
import { View, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { User, MoreVertical, ChevronUp } from 'lucide-react-native';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useGetChatroomParticipants } from '../hooks/chats/useGetChatroomParticipants';
import { useGetCurrentUserProfile } from '../hooks/useGetCurrentUserProfile';
import { ChatRoomParticipant } from '../hooks/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface ChatroomSideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  chatroomId: string;
  hostId: string;
  onKickParticipant?: (userId: string) => void;
  onBanParticipant?: (userId: string) => void;
  onChangeNickname?: (userId: string) => void;
  parentRef?: React.RefObject<View>;
}

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.8;

interface ParticipantItemProps {
  participant: ChatRoomParticipant;
  isCurrentUser: boolean;
  isHost: boolean;
  onShowActions: (participant: ChatRoomParticipant) => void;
}

function ParticipantItem({ participant, isCurrentUser, isHost, onShowActions }: ParticipantItemProps) {
  const showActionButton = isCurrentUser || isHost;

  return (
    <View className="flex-row items-center py-3 px-6">
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
        <Text className="text-base font-medium text-gray-900">
          {participant.nickname || participant.user?.username || 'Unknown User'}
        </Text>
      </View>
      {showActionButton && (
        <TouchableOpacity
          onPress={() => onShowActions(participant)}
          className="p-2 -mr-2"
        >
          <MoreVertical size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ChatroomSideMenu({ 
  isVisible, 
  onClose, 
  chatroomId,
  hostId,
  onKickParticipant,
  onBanParticipant,
  onChangeNickname
}: ChatroomSideMenuProps) {
  const { data: participants, isLoading } = useGetChatroomParticipants(chatroomId);
  const { data: currentUser } = useGetCurrentUserProfile();
  const currentUserId = currentUser?.id;
  const [selectedParticipant, setSelectedParticipant] = useState<ChatRoomParticipant | null>(null);
  const [showKickDialog, setShowKickDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);

  const handleShowActions = (participant: ChatRoomParticipant) => {
    const isCurrentUser = participant.user_id === currentUserId;
    const isHost = currentUserId === hostId;

    setSelectedParticipant(participant);

    if (isHost && !isCurrentUser) {
      // Show host actions dialog
      setShowKickDialog(true);
    } else if (isCurrentUser) {
      // Show self actions dialog
      setShowNicknameDialog(true);
    }
  };

  const handleShowBanDialog = () => {
    setShowKickDialog(false);
    setShowBanDialog(true);
  };

  const handleKick = () => {
    if (selectedParticipant) {
      onKickParticipant?.(selectedParticipant.user_id);
      setShowKickDialog(false);
      setSelectedParticipant(null);
    }
  };

  const handleBan = () => {
    if (selectedParticipant) {
      onBanParticipant?.(selectedParticipant.user_id);
      setShowBanDialog(false);
      setSelectedParticipant(null);
    }
  };

  const handleChangeNickname = () => {
    if (selectedParticipant) {
      onChangeNickname?.(selectedParticipant.user_id);
      setShowNicknameDialog(false);
      setSelectedParticipant(null);
    }
  };

  const renderParticipant = ({ item }: { item: ChatRoomParticipant }) => {
    const isCurrentUser = item.user_id === currentUserId;
    const isHost = currentUserId === hostId;
    
    return (
      <ParticipantItem 
        participant={item} 
        isCurrentUser={isCurrentUser}
        isHost={isHost}
        onShowActions={handleShowActions}
      />
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="right"
      animationIn="slideInRight"
      animationOut="slideOutRight"
      backdropOpacity={0.1}
      style={{
        margin: 0,
        justifyContent: 'flex-end',
        flexDirection: 'row',
      }}
      propagateSwipe={true}
      swipeThreshold={50}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
    >
      <View 
        style={{ width: MENU_WIDTH }}
        className="bg-white h-full shadow-2xl pt-20"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-4 px-6 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            Participants ({participants?.length || 0})
          </Text>
        </View>

        {/* Participants List */}
        <View className="flex-1 mt-2 mb-4">
            <FlatList
              data={participants || []}
              bounces={false}
              renderItem={renderParticipant}
              keyExtractor={(item) => item.user_id}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            />
        </View>

        {/* Banned Users Accordion */}
        {currentUserId === hostId && (
          <View className="flex-1 px-6 border-t border-gray-200">
            <Accordion type="single" collapsible>
              <AccordionItem value="banned-users" className="border-b-0">
                <AccordionTrigger className="py-3">
                  <Text className="text-gray-700">Banned (0)</Text>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-500 text-center text-sm">
                      No banned users
                    </Text>
                  </View>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </View>
        )}
      </View>

      {/* Kick Dialog */}
      <AlertDialog open={showKickDialog} onOpenChange={setShowKickDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manage Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Choose an action for {selectedParticipant?.nickname || selectedParticipant?.user?.username || 'this user'}:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onPress={handleKick}>Kick</AlertDialogAction>
            <AlertDialogAction onPress={handleShowBanDialog}>Ban</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {selectedParticipant?.nickname || selectedParticipant?.user?.username || 'this user'} from the chatroom? They will not be able to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onPress={handleBan}>Ban</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Nickname Dialog */}
      <AlertDialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Nickname</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to change your nickname in this chatroom?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onPress={handleChangeNickname}>Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
}