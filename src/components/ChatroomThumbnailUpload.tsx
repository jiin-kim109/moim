import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import { Camera, ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@components/ui/text';
import { cn } from '@lib/utils';

interface ChatroomThumbnailUploadProps {
  value?: string | null;
  onImageChange?: (imageUri: string | null) => void;
  className?: string;
}

export default function ChatroomThumbnailUpload({
  value,
  onImageChange,
  className
}: ChatroomThumbnailUploadProps) {
  const [imageUri, setImageUri] = useState<string | null>(value || null);

  const requestPermissions = async () => {
    const { status: cameraRollStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (cameraRollStatus !== 'granted' || cameraStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Sorry, we need camera and photo library permissions to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const showImagePicker = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        {
          text: 'Choose from Gallery',
          onPress: pickImageFromGallery,
        },
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onImageChange?.(uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onImageChange?.(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeImage = () => {
    setImageUri(null);
    onImageChange?.(null);
  };

  return (
    <View className={cn('relative', className)}>
      <TouchableOpacity
        onPress={showImagePicker}
        className={cn(
          'w-full h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center',
          imageUri && 'border-solid border-gray-200'
        )}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center">
            <ImageIcon size={40} color="#9CA3AF" className="mb-2" />
            <Text className="text-gray-500 text-center text-sm">
              Tap to add thumbnail
            </Text>
            <Text className="text-gray-400 text-center text-xs mt-1">
              16:9 aspect ratio recommended
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {imageUri && (
        <TouchableOpacity
          onPress={removeImage}
          className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
        >
          <X size={16} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
} 