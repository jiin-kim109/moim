import React from 'react';
import { View } from 'react-native';
import { Text } from '@components/ui/text';
import { ChatMessage as ChatMessageType } from '@hooks/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser?: boolean;
}

export default function ChatMessage({ message, isCurrentUser = false }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (message.is_deleted) {
    return (
      <View className={`mb-3 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <View className="max-w-[80%]">
          <Text className="text-xs text-gray-400 mb-1">
            {message.sender_nickname}
          </Text>
          <View
            className={`px-4 py-2 rounded-2xl ${
              isCurrentUser 
                ? 'bg-gray-200 rounded-br-md' 
                : 'bg-gray-100 rounded-bl-md'
            }`}
          >
            <Text className="text-gray-400 italic">This message was deleted</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">
            {formatTime(message.created_at)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={`mb-3 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      <View className="max-w-[80%]">
        {!isCurrentUser && (
          <Text className="text-xs text-gray-500 mb-1">
            {message.sender_nickname}
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
              className={`text-xs mt-1 italic ${
                isCurrentUser ? 'text-orange-100' : 'text-gray-400'
              }`}
            >
              edited
            </Text>
          )}
        </View>
        <Text className="text-xs text-gray-400 mt-1">
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
} 