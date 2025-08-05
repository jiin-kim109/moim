import React from 'react';
import { SafeAreaView, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Select, SelectOption } from '@components/ui/select';
import LocationInput from '@components/LocationInput';
import ChatroomThumbnailUpload from '@components/ChatroomThumbnailUpload';
import { useCreateChatroom } from '@hooks/chats/useCreateChatroom';
import { useGetJoinedChatrooms } from '@hooks/chats/useGetJoinedChatrooms';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { FileHolder } from '@lib/objectstore';
import { useDebouncedFunction } from '@lib/utils';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';

// Form schema for creating a chatroom
const createChatroomSchema = z.object({
  thumbnail_file: z.instanceof(FileHolder).nullable().optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must be 50 characters or less'),
  description: z
    .string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),
  max_participants: z
    .number()
    .min(2, 'Must allow at least 2 participants')
    .max(300, 'Cannot exceed 300 participants'),
  location: z
    .object({
      place_name: z.string().min(1, 'Location is required'),
      longitude: z.number(),
      latitude: z.number(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    })
    .nullable()
    .refine((data) => data !== null, {
      message: 'Location is required',
    }),
});

type CreateChatroomFormValues = z.infer<typeof createChatroomSchema>;

export default function CreateChatroomScreen() {
  const router = useRouter();
  const createChatroomMutation = useCreateChatroom();
  const { data: userProfile } = useGetCurrentUserProfile();
  const currentUserId = userProfile?.id;

  // Get joined chatrooms to check hosting limit
  const { data: joinedChatrooms } = useGetJoinedChatrooms(currentUserId || '', {
    enabled: !!currentUserId,
  });

  const form = useForm<CreateChatroomFormValues>({
    resolver: zodResolver(createChatroomSchema),
    defaultValues: {
      thumbnail_file: null,
      title: '',
      description: '',
      max_participants: 30,
      location: null,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!currentUserId) {
      console.error('User not authenticated');
      return;
    }

    // Check if user is already hosting 10 chatrooms
    const hostedChatroomsCount = joinedChatrooms?.filter(chatroom => 
      chatroom.host_id === currentUserId
    ).length || 0;

    if (hostedChatroomsCount >= 10) {
      Alert.alert(
        'Chatroom Limit Reached',
        'You can only host up to 10 chatrooms at a time. Please delete one of your existing chatrooms.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      const chatroomData = {
        title: data.title,
        description: data.description || undefined,
        thumbnail_file: data.thumbnail_file || null,
        max_participants: data.max_participants,
        host_id: currentUserId,
        address: {
          place_name: data.location!.place_name,
          address: data.location!.address,
          city: data.location!.city,
          state: data.location!.state,
          postal_code: data.location!.postal_code,
          country: data.location!.country,
          longitude: data.location!.longitude,
          latitude: data.location!.latitude,
        },
      };

      const newChatroom = await createChatroomMutation.mutateAsync(chatroomData);
      
      // Navigate to chats first, then to the specific chatroom
      router.replace('/chats');
      router.push(`/chatroom/${newChatroom.id}`);
    } catch (error: any) {
      console.error('Failed to create chatroom:', error);
      Alert.alert(
        'Error',
        'Failed to create chatroom. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  });

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={useDebouncedFunction(() => router.back())}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          
          <Text className="text-xl font-semibold text-gray-900 flex-1 text-center ml-5">
            Create Chatroom
          </Text>
          
          <TouchableOpacity
            onPress={useDebouncedFunction(handleSubmit)}
            className="p-2"
          >
            <Text className="font-semibold text-xl text-orange-500">
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Form {...form}>
                         <ScrollView 
               className="flex-1 px-6 py-6"
               showsVerticalScrollIndicator={false}
               contentContainerStyle={{ flexGrow: 1 }}
               keyboardShouldPersistTaps="handled"
             >
               {/* Thumbnail Upload Field */}
               <View className="mb-6">
                 <FormField
                   control={form.control}
                   name="thumbnail_file"
                   render={({ field, fieldState }) => (
                     <FormItem>
                       <FormControl>
                         <ChatroomThumbnailUpload
                           value={field.value?.uri || null}
                           onImageChange={field.onChange}
                         />
                       </FormControl>
                       <FormMessage>{fieldState.error?.message}</FormMessage>
                     </FormItem>
                   )}
                 />
               </View>

               {/* Title Field */}
            <View className="mb-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-medium">
                      Chatroom Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Enter chatroom name"
                        error={!!fieldState.error}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </View>

            {/* Description Field */}
            <View className="mb-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value || ''}
                        onChangeText={field.onChange}
                        placeholder="What do you want to chat about? Share the topic, interests, or purpose of this chatroom!"
                        numberOfLines={4}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </View>

            {/* Max Participants Field */}
            <View className="mb-6">
              <FormField
                control={form.control}
                name="max_participants"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-medium">
                      Max Participants *
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? {
                          value: field.value.toString(),
                          label: `${field.value} participants`
                        } : null}
                        onValueChange={(option: SelectOption) => {
                          field.onChange(parseInt(option.value, 10));
                        }}
                        placeholder="Select max participants"
                        options={[
                          { value: "30", label: "30 participants" },
                          { value: "100", label: "100 participants" },
                        ]}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </View>

            {/* Location Field */}
            <View className="mb-8">
              <FormField
                control={form.control}
                name="location"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-medium">
                      Location *
                    </FormLabel>
                    <FormControl>
                      <LocationInput
                        placeholder="Enter chatroom location"
                        onLocationChange={field.onChange}
                        placeType="place"
                        value={field.value}
                        countries={['US', 'CA']}
                        autoFillCurrentLocation
                        error={!!fieldState.error}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Text className="text-sm text-gray-500 mt-2 px-1">
                Your chatroom will be displayed to other users nearby this location
              </Text>
            </View>
            </ScrollView>
          </Form>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
