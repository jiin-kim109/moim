import React, { useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Animated } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import LocationInput from '@components/LocationInput';

import { findUserByUsername } from '@hooks/useFindUser';
import { useUpdateUserProfile } from '@hooks/useUpdateUserProfile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { useRouter } from 'expo-router';

// Form schema for the entire onboarding flow
const onboardingSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(16, 'Username must be at most 16 characters'),
  location: z
    .object({
      place_name: z.string().min(1, 'Location is required'),
      longitude: z.number(),
      latitude: z.number(),
    })
    .nullable()
    .refine((data) => data !== null, {
      message: 'Location is required',
    }),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface StepProps {
  form: any;
}

function UsernameStep({ form }: StepProps) {
  return (
    <View className="flex-1 px-6 pt-8">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Choose your username
        </Text>
        <Text className="text-lg text-gray-600">
          This is how others will see you in chat rooms
        </Text>
      </View>

      <View className="mb-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  value={field.value}
                  onChangeText={(text) => field.onChange(text.toLowerCase())}
                  onBlur={field.onBlur}
                  placeholder="Enter your username"
                  autoCapitalize="none"
                  error={!!fieldState.error}
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
      </View>
    </View>
  );
}

function LocationStep({ form }: StepProps) {
  return (
    <View className="flex-1 px-6 pt-8">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Set your location
        </Text>
        <Text className="text-lg text-gray-600">
          Find chat rooms and people near you
        </Text>
      </View>

      <View className="mb-8">
        <FormField
          control={form.control}
          name="location"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationInput
                  placeholder="Enter your city or area"
                  onLocationChange={field.onChange}
                  placeType="place"
                  value={field.value}
                  countries={['US', 'CA']}
                  autoFillCurrentLocation
                  error={!!fieldState.error}
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  
  const updateUser = useUpdateUserProfile();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: '',
      location: null,
    },
  });

  const steps = [
    { component: UsernameStep },
    { component: LocationStep },
  ];

  const animateToNext = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep((prev) => prev + 1);
      slideAnim.setValue(100);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const animateToBack = () => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep((prev) => prev - 1);
      slideAnim.setValue(-100);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const isValid = await form.trigger('username');
      if (isValid) {
        // Check if username already exists
        const rawUsername = form.getValues('username') || '';
        const username = rawUsername.toLowerCase();
        if (rawUsername !== username) {
          form.setValue('username', username, { shouldValidate: false });
        }
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
          form.setError('username', {
            type: 'manual',
            message: 'This username is already taken',
          });
          return;
        }
        animateToNext();
      }
    } else if (currentStep === 1) {
      // Validate location step and submit
      const isValid = await form.trigger('location');
      if (isValid) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(async (data) => {
      const username = (data.username || '').toLowerCase();
      await updateUser.mutateAsync({
        username,
        is_onboarded: true,
        address: data.location || undefined,
      });

      router.replace('/browse');
    })();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateToBack();
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Form {...form}>
        {/* Progress indicator */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row gap-2">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`flex-1 h-1 rounded-full ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Animated step content */}
        <Animated.View
          className="flex-1"
          style={{
            transform: [{ translateX: slideAnim }],
          }}
        >
          <CurrentStepComponent form={form} />
        </Animated.View>

        {/* Navigation buttons */}
        <View className="px-6 pb-8">
          {currentStep === 0 ? (
            // Username step - only Continue button
            <TouchableOpacity
              onPress={handleNext}
              className="bg-blue-500 py-4 px-6 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold text-lg mr-2">Continue</Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          ) : (
            // Location step - Back and Finish buttons
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={handleBack}
                className="flex-1 bg-gray-200 py-4 px-6 rounded-lg flex-row items-center justify-center"
              >
                <ChevronLeft size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold text-lg ml-2">Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleNext}
                className="flex-1 bg-blue-500 py-4 px-6 rounded-lg flex-row items-center justify-center"
              >
                <Text className="text-white font-semibold text-lg mr-2">Finish</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Form>
    </SafeAreaView>
  );
} 