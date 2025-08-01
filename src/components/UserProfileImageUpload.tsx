import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@components/ui/text';
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar';
import { cn } from '@lib/utils';
import { FileHolder } from '@lib/objectstore';

interface UserProfileImageUploadProps {
  value?: string | null;
  onImageChange?: (fileHolder: FileHolder | null) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-16 h-16',
  medium: 'w-24 h-24',
  large: 'w-32 h-32',
};

export default function UserProfileImageUpload({
  value,
  onImageChange,
  className,
  size = 'large'
}: UserProfileImageUploadProps) {
  const [imageUri, setImageUri] = useState<string | null>(value || null);

  // Sync internal state with value prop changes
  useEffect(() => {
    setImageUri(value || null);
  }, [value]);

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

    const menuOptions: any[] = [
      {
        text: 'Choose from Gallery',
        onPress: pickImageFromGallery,
      },
      {
        text: 'Take Photo',
        onPress: takePhoto,
      },
    ];

    // Add remove option if there's an existing image
    if (imageUri) {
      menuOptions.push({
        text: 'Remove Photo',
        onPress: removeImage,
        style: 'destructive',
      });
    }

    menuOptions.push({
      text: 'Cancel',
      style: 'cancel',
    });

    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to select your profile picture',
      menuOptions
    );
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        const fileHolder = FileHolder.fromUri(uri);
        onImageChange?.(fileHolder);
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
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        const fileHolder = FileHolder.fromUri(uri);
        onImageChange?.(fileHolder);
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
      <TouchableOpacity onPress={showImagePicker}>
        <Avatar className={cn(sizeClasses[size], 'border-2 border-dashed border-gray-300', imageUri && 'border-solid border-gray-200')} alt="Profile picture">
          {imageUri ? (
            <AvatarImage source={{ uri: imageUri }} />
          ) : (
            <AvatarFallback className="bg-gray-50">
              <View className="items-center">
                <User size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} color="#9CA3AF" />
                {size === 'large' && (
                  <Text className="text-gray-500 text-center text-xs mt-1">
                    Add Photo
                  </Text>
                )}
              </View>
            </AvatarFallback>
          )}
        </Avatar>
      </TouchableOpacity>
    </View>
  );
} 