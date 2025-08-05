import React from 'react';
import { SafeAreaView, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import { toast } from 'sonner-native';
import { Text } from '@components/ui/text';
import LocationInput from '@components/LocationInput';
import { useGetCurrentUserProfile } from '@hooks/useGetCurrentUserProfile';
import { useUpdateUserProfile } from '@hooks/useUpdateUserProfile';
import supabase from '@lib/supabase';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';

// Form schema for updating location
const updateLocationSchema = z.object({
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

type UpdateLocationFormValues = z.infer<typeof updateLocationSchema>;

export default function UpdateLocationScreen() {
  const router = useRouter();
  const updateUserMutation = useUpdateUserProfile();
  
  // Get current user profile
  const { data: userProfile } = useGetCurrentUserProfile();

  const form = useForm<UpdateLocationFormValues>({
    resolver: zodResolver(updateLocationSchema),
    defaultValues: {
      location: null,
    },
  });

  // Update form when user profile loads
  React.useEffect(() => {
    if (userProfile?.address && userProfile.address.place_name) {
      form.setValue('location', {
        place_name: userProfile.address.place_name,
        longitude: userProfile.address.longitude || 0,
        latitude: userProfile.address.latitude || 0,
        address: userProfile.address.address,
        city: userProfile.address.city,
        state: userProfile.address.state,
        postal_code: userProfile.address.postal_code,
        country: userProfile.address.country,
      });
    }
  }, [userProfile?.address, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await updateUserMutation.mutateAsync({
        address: data.location || undefined,
      });

      toast.success('Location updated successfully!');
      router.replace('/profile');
    } catch (error: any) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update location. Please try again.');
    }
  });

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => router.replace('/profile')}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          
          <Text className="text-xl font-semibold text-gray-900 flex-1 text-center ml-5">
            Update Location
          </Text>
          
          <TouchableOpacity
            onPress={handleSubmit}
            className="p-2"
            disabled={updateUserMutation.isPending}
          >
            <Text className="font-semibold text-xl text-orange-500">
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Form {...form}>
            <View className="flex-1 px-6 py-6">
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
                          placeholder="Enter your city or area"
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
                  This will be used to show you relevant chatrooms in your neighborhood.
                </Text>
              </View>
            </View>
          </Form>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}