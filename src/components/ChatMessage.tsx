import React from 'react';
import { View } from 'react-native';
import { User } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar';
import { ChatMessage as ChatMessageType } from '@hooks/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser?: boolean;
}

interface DeletedMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

interface SystemMessageProps {
  message: ChatMessageType;
}

function DeletedMessage({ message, isCurrentUser }: DeletedMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className={`mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && (
          <Avatar className="w-14 h-14 mr-2 !rounded-2xl" alt={`${message.sender_nickname}`}>
            {message.sender?.profile_image_url ? (
              <AvatarImage source={{ uri: message.sender.profile_image_url }} />
            ) : (
              <AvatarFallback className="bg-gray-100 !rounded-2xl">
                <User size={16} color="#9CA3AF" />
              </AvatarFallback>
            )}
          </Avatar>
        )}
        <View className="flex-1">
          {!isCurrentUser && (
            <Text className="text-base text-gray-400 mb-2">
              {message.sender_nickname}
            </Text>
          )}
          <View className={`flex-row items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {isCurrentUser && (
              <Text className="text-sm text-gray-400 mr-2">
                {formatTime(message.created_at)}
              </Text>
            )}
            <View
              className={`px-4 py-2 rounded-2xl ${
                isCurrentUser 
                  ? 'bg-gray-200 rounded-br-md' 
                  : 'bg-gray-100 rounded-bl-md'
              }`}
            >
              <Text className="text-gray-400 italic">This message was deleted</Text>
            </View>
            {!isCurrentUser && (
              <Text className="text-sm text-gray-400 ml-2">
                {formatTime(message.created_at)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function SystemMessage({ message }: SystemMessageProps) {
  return (
    <View className="mb-5 mt-1 items-center">
      <View className="bg-gray-400/30 px-5 py-1 rounded-2xl max-w-[85%]">
        <Text className="text-sm text-gray-600 text-center">
          {message.message}
        </Text>
      </View>
    </View>
  );
}

export default function ChatMessage({ message, isCurrentUser = false }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // System message
  if (message.message_type === 'system_message') {
    return <SystemMessage message={message} />;
  }

  // Deleted message
  if (message.is_deleted) {
    return <DeletedMessage message={message} isCurrentUser={isCurrentUser} />;
  }

  // Normal message
  return (
    <View className={`mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && (
          <Avatar className="w-14 h-14 mr-2 !rounded-2xl" alt={`${message.sender_nickname}`}>
            {message.sender?.profile_image_url ? (
              <AvatarImage source={{ uri: message.sender.profile_image_url }} />
            ) : (
              <AvatarFallback className="bg-gray-100 !rounded-2xl">
                <User size={16} color="#9CA3AF" />
              </AvatarFallback>
            )}
          </Avatar>
        )}
        <View className="flex-1">
          {!isCurrentUser && (
            <Text className="text-base text-gray-500 mb-2">
              {message.sender_nickname}
            </Text>
          )}
          <View className={`flex-row items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {isCurrentUser && (
              <Text className="text-sm text-gray-400 mr-2">
                {formatTime(message.created_at)}
              </Text>
            )}
            <View
              className={`px-4 py-2 rounded-2xl ${
                isCurrentUser 
                  ? 'bg-orange-500 rounded-br-md' 
                  : 'bg-white rounded-bl-md border border-gray-200'
              }`}
            >
              <Text className={`text-base ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
                {message.message}
              </Text>
              {message.is_edited && (
                <Text 
                  className={`text-sm mt-1 italic ${
                    isCurrentUser ? 'text-orange-100' : 'text-gray-400'
                  }`}
                >
                  edited
                </Text>
              )}
            </View>
            {!isCurrentUser && (
              <Text className="text-sm text-gray-400 ml-2">
                {formatTime(message.created_at)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
} 