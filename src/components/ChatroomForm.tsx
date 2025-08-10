import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '@components/ui/text';
import ChatroomThumbnailUpload from '@components/ChatroomThumbnailUpload';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Select, SelectOption } from '@components/ui/select';
import LocationInput from '@components/LocationInput';
import { FileHolder } from '@lib/objectstore';
import { Address, ChatRoom } from '@hooks/types';
import { useCreateChatroom } from '@hooks/chats/useCreateChatroom';
import { useUpdateChatroom } from '@hooks/chats/useUpdateChatroom';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useDebouncedFunction } from '@lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';

type Mode = 'create' | 'update';

export type ChatroomFormDefaultValues = {
  title?: string;
  description?: string | null;
  max_participants?: number | null;
  thumbnail_url?: string | null;
  address?: Address | null;
};

type ChatroomFormProps = {
  mode: Mode;
  chatroomId?: string; // required for update
  defaultValues?: ChatroomFormDefaultValues;
  disableLocationField?: boolean;
  onSubmitted?: (chatroom: ChatRoom) => void;
  onReady?: (submit: () => void) => void; // exposes submit trigger to parent
};

export default function ChatroomForm({
  mode,
  chatroomId,
  defaultValues,
  disableLocationField = false,
  onSubmitted,
  onReady,
}: ChatroomFormProps) {
  const { data: currentUser } = useGetCurrentUserProfile();
  const createMutation = useCreateChatroom();
  const updateMutation = useUpdateChatroom();

  const [thumbnailUri, setThumbnailUri] = useState<string | null>(defaultValues?.thumbnail_url || null);
  const [location, setLocation] = useState<Address | null>(defaultValues?.address || null);

  const maxParticipantOptions: SelectOption[] = useMemo(() => (
    [10,15,20,25,30,40,50,60,70,80,90,100].map((n) => ({
      value: String(n),
      label: `${n} participants`,
    }))
  ), []);

  const baseSchema = {
    thumbnail_file: z.instanceof(FileHolder).nullable().optional(),
    title: z
      .string()
      .min(1, 'Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(30, 'Title must be 30 characters or less'),
    description: z
      .string()
      .max(200, 'Description must be 200 characters or less')
      .optional(),
    max_participants: z
      .number()
      .min(2, 'Must allow at least 2 participants')
      .max(300, 'Cannot exceed 300 participants'),
  } as const;

  const createSchema = z.object({
    ...baseSchema,
    location: z.object({
      place_name: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
      longitude: z.number(),
      latitude: z.number(),
    }),
  });

  const updateSchema = z.object(baseSchema);

  type CreateFormValues = z.infer<typeof createSchema>;
  type UpdateFormValues = z.infer<typeof updateSchema>;

  const form = useForm<CreateFormValues | UpdateFormValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : updateSchema),
    defaultValues: {
      thumbnail_file: undefined as unknown as null,
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      max_participants: defaultValues?.max_participants || 30,
      ...(mode === 'create' ? { location: (defaultValues?.address as any) || null } : {}),
    } as any,
  });

  useEffect(() => {
    setThumbnailUri(defaultValues?.thumbnail_url || null);
    setLocation(defaultValues?.address || null);
    form.reset({
      thumbnail_file: undefined as unknown as null,
      title: defaultValues?.title || '',
      description: (defaultValues?.description as string) || '',
      max_participants: defaultValues?.max_participants || 30,
      ...(mode === 'create' ? { location: (defaultValues?.address as any) || null } : {}),
    } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.title, defaultValues?.description, defaultValues?.max_participants, defaultValues?.thumbnail_url]);

  const handleThumbnailChange = (fileHolder: FileHolder | null) => {
    setThumbnailUri(fileHolder ? fileHolder.uri : null);
    (form as any).setValue('thumbnail_file', fileHolder as any, { shouldValidate: false });
  };

  const submit = async (values: any) => {
    if (mode === 'create') {
      if (!currentUser?.id) return;
      const payload = {
        title: values.title,
        description: values.description || undefined,
        thumbnail_file: values.thumbnail_file ?? undefined,
        max_participants: values.max_participants,
        host_id: currentUser.id,
        address: values.location,
      };
      const result = await createMutation.mutateAsync(payload as any);
      onSubmitted?.(result);
    } else {
      if (!chatroomId) return;
      const payload: any = { chatroom_id: chatroomId };
      payload.title = values.title;
      payload.description = values.description || null;
      payload.max_participants = values.max_participants || null;
      if (values.thumbnail_file !== undefined) payload.thumbnail_file = values.thumbnail_file;
      const result = await updateMutation.mutateAsync(payload);
      onSubmitted?.(result);
    }
  };

  // Provide a submit function to the parent
  const submitFunc = useDebouncedFunction(() => (form.handleSubmit as any)(submit)());
  useEffect(() => {
    onReady?.(submitFunc);
  }, [submitFunc, onReady]);

  return (
    <ScrollView
      className="flex-1 px-6 py-6"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <Form {...(form as any)}>
        {/* Thumbnail Upload */}
        <View className="mb-6">
          <FormField
            control={(form as any).control}
            name="thumbnail_file"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <ChatroomThumbnailUpload
                    value={field.value?.uri ?? thumbnailUri}
                    onImageChange={handleThumbnailChange}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        </View>

        {/* Title */}
        <View className="mb-6">
          <FormField
            control={(form as any).control}
            name="title"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-900 font-medium">Chatroom Name *</FormLabel>
                <FormControl>
                  <Input
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="Enter chatroom name"
                    error={!!fieldState.error}
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <FormField
            control={(form as any).control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-900 font-medium">Description</FormLabel>
                <FormControl>
                  <Textarea
                    value={field.value || ''}
                    onChangeText={field.onChange}
                    numberOfLines={4}
                    placeholder='What do you want to chat about? Share the topic, interests, or purpose of this chatroom!'
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        </View>

        {/* Max Participants */}
        <View className="mb-6">
          <FormField
            control={(form as any).control}
            name="max_participants"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-900 font-medium">Max Participants *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ? { value: field.value.toString(), label: `${field.value} participants` } : null}
                    onValueChange={(option: SelectOption) => field.onChange(parseInt(option.value, 10))}
                    placeholder="Select max participants"
                    options={maxParticipantOptions}
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        </View>

        {/* Location */}
        <View className="mb-2">
          <Text className="text-gray-900 font-medium mb-2">Location</Text>
          {mode === 'create' && !disableLocationField ? (
            <FormField
              control={(form as any).control}
              name="location"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <LocationInput
                      placeholder="Enter chatroom location"
                      onLocationChange={field.onChange}
                      placeType="place"
                      value={field.value || location || null}
                      countries={['US', 'CA']}
                      autoFillCurrentLocation
                      error={!!fieldState.error}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          ) : (
            <LocationInput
              placeholder="Location"
              onLocationChange={() => { /* disabled - no-op */ }}
              placeType="place"
              value={location || null}
              countries={['US', 'CA']}
              disabled
              className="mt-1"
            />
          )}
          {disableLocationField && (
            <Text className="text-xs text-gray-500 mt-2 px-1">Location cannot be changed.</Text>
          )}
        </View>
      </Form>
    </ScrollView>
  );
}


