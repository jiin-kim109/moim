import React from 'react';
import { View } from 'react-native';
import { Text } from '@components/ui/text';

export default function SplashScreen() {
  return (
    <View className="flex-1 bg-primary items-center justify-center px-5">
      {/* Main Logo */}
      <View className="items-center mb-8">
        {/* Logo Circle */}
        <View className="w-24 h-24 bg-primary-foreground/20 rounded-full items-center justify-center mb-4 shadow-lg">
          <View className="w-16 h-16 bg-primary-foreground rounded-full items-center justify-center">
            <Text className="text-3xl font-bold text-primary">M</Text>
          </View>
        </View>
        
        {/* App Name */}
        <Text className="text-5xl font-bold text-primary-foreground tracking-wide">
          Moim
        </Text>
      </View>

      {/* Subtitle */}
      <View className="items-center">
        <Text className="text-lg text-primary-foreground/90 text-center leading-6">
          Chat with your neighbors
        </Text>
      </View>
    </View>
  );
}
