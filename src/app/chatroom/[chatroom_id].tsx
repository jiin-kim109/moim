import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send } from 'lucide-react-native';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { useGetChatroom } from '@hooks/useGetChatroom';

export default function ChatroomScreen() {
  const router = useRouter();
  const { chatroom_id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  
  const { data: chatroom, isLoading } = useGetChatroom(chatroom_id as string);

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement send message logic
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <View className="flex-1 bg-orange-50">
      <SafeAreaView className="flex-1 bg-orange-50">
        {/* Header */}
        <View className="flex-row items-center px-4 py-1 bg-orange-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <View className="flex-row items-center gap-3">
            <Text className="text-xl font-semibold text-gray-900">
              {chatroom?.title}
            </Text>
            <Text className="text-lg text-gray-500">
              {chatroom?.participant_count || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Chat Messages Area */}
      <ScrollView className="flex-1 bg-orange-50" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-4 py-2">
          {/* TODO: Implement chat messages */}
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Chat messages will appear here</Text>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
      
      {/* Message Input Area */}
      <View className="px-4 pb-12 py-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center px-2 gap-3">
          <View className="flex-1">
            <Input
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              multiline
              className="bg-gray-100 border-0 rounded-2xl px-4 py-3 min-h-12 max-h-32 text-base"
              style={{
                textAlignVertical: 'center',
              }}
            />
          </View>
          
          <Button
            onPress={handleSend}
            disabled={!message.trim()}
            size="icon"
            className={`w-12 h-12 rounded-full ${
              message.trim() ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            <Send 
              size={20} 
              color="white" 
              style={{ marginLeft: 2 }} // Slight offset to center the icon
            />
          </Button>
        </View>
      </View>
    </View>
  );
} 