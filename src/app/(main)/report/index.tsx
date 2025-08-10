import React from 'react';
import { SafeAreaView, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';

import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import { useCreateReport } from '@hooks/useCreateReport';
import { useDebouncedFunction } from '@lib/utils';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';

const presetReasons = [
  { value: 'sexual', label: 'Sexual content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate', label: 'Hate speech' },
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'illegal', label: 'Illegal activity' },
  { value: 'other', label: 'Other' },
] as const;

const reportSchema = z.object({
  selectedReason: z.string().min(1, 'Please choose one reason'),
  details: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.selectedReason === 'other') {
    if (!data.details || data.details.trim().length < 5) {
      ctx.addIssue({
        message: 'Please describe the issue (at least 5 characters)',
        path: ['details'],
      });
    }
  }
});

type ReportFormValues = z.infer<typeof reportSchema>;

type LocalParams = {
  type?: 'chatroom' | 'message' | 'user';
  payload?: string; // JSON string (optional)
  chatroom_id?: string;
  message_id?: string;
  reported_user_id?: string;
};

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<LocalParams>();
  const createReportMutation = useCreateReport();

  const defaultType = (params.type as any) || 'message';

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      selectedReason: '' as any,
      details: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const reasonLabel = presetReasons.find(p => p.value === values.selectedReason)?.label || values.selectedReason;
    const reason = values.selectedReason === 'other' && values.details 
      ? values.details.trim() 
      : reasonLabel;

    // Build payload from route params
    let parsedPayload: any = {};
    if (params.payload) {
      try {
        parsedPayload = JSON.parse(params.payload as string);
      } catch {
        parsedPayload = { raw: params.payload };
      }
    }

    const payload = {
      chatroom_id: params.chatroom_id || parsedPayload.chatroom_id || undefined,
      message_id: params.message_id || parsedPayload.message_id || undefined,
      reported_user_id: params.reported_user_id || parsedPayload.reported_user_id || undefined,
      context: parsedPayload.context || undefined,
    };

    await createReportMutation.mutateAsync({
      report_type: defaultType,
      reason,
      payload,
    });

    router.back();
  });

  const onSelectReason = (value: (typeof presetReasons)[number]['value']) => {
    const current = form.getValues('selectedReason');
    const newValue = current === value ? '' : value;
    form.setValue('selectedReason', newValue, { shouldValidate: true });
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>

          <Text className="text-xl font-semibold text-gray-900 flex-1 text-center ml-5">
            Report
          </Text>

          <TouchableOpacity onPress={useDebouncedFunction(handleSubmit)} className="p-2">
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
              {/* Reason checkboxes */}
              <View className="mb-6">
                <Text className="text-gray-900 font-medium mb-2">Reason *</Text>
                <FormField
                  control={form.control}
                  name="selectedReason"
                  render={({ fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <View className="gap-4">
                          {presetReasons.map((reason) => {
                            const selected = form.watch('selectedReason');
                            const checked = selected === reason.value;
                            return (
                              <TouchableOpacity 
                                key={reason.value} 
                                className="flex-row items-center gap-3"
                                onPress={() => onSelectReason(reason.value)}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => onSelectReason(reason.value)}
                                />
                                <Text className="text-gray-800">{reason.label}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </FormControl>
                      {fieldState.error && (
                        <Text className="text-red-500 text-sm mt-2">{fieldState.error.message}</Text>
                      )}
                    </FormItem>
                  )}
                />
              </View>

              {/* Other details textarea (only shown if Other is selected) */}
              {form.watch('selectedReason') === 'other' && (
                <View className="mb-6">
                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field, fieldState }) => {
                      const currentLength = (field.value || '').length;
                      const maxLength = 50;
                      
                      const handleTextChange = (text: string) => {
                        if (text.length <= maxLength) {
                          field.onChange(text);
                        }
                      };
                      
                      return (
                        <FormItem>
                          <FormLabel className="text-gray-900 font-medium">Please describe the issue</FormLabel>
                          <FormControl>
                            <View className="relative">
                              <Textarea
                                value={field.value || ''}
                                onChangeText={handleTextChange}
                                placeholder="Describe the issue in more detail"
                                numberOfLines={4}
                                className="mt-2"
                              />
                              <View className="absolute bottom-2 right-2">
                                <Text className="text-xs text-gray-400">
                                  {currentLength}/{maxLength}
                                </Text>
                              </View>
                            </View>
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      );
                    }}
                  />
                </View>
              )}
            </ScrollView>
          </Form>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
