import React from 'react';
import { View } from 'react-native';
import { Text } from '@components/ui/text';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: {
      circle: 'w-8 h-8',
      outerCircle: 'w-12 h-12',
      text: 'text-sm'
    },
    md: {
      circle: 'w-10 h-10',
      outerCircle: 'w-14 h-14',
      text: 'text-lg'
    },
    lg: {
      circle: 'w-12 h-12',
      outerCircle: 'w-16 h-16',
      text: 'text-xl'
    },
    xl: {
      circle: 'w-16 h-16',
      outerCircle: 'w-20 h-20',
      text: 'text-2xl'
    }
  };

  const currentSize = sizes[size];

  return (
    <View className={`flex-row items-center ${className}`}>
      {/* M - Orange circle with surrounding effect */}
      <View className="relative items-center justify-center">
        {/* Outer transparent circle */}
        <View className={`${currentSize.outerCircle} bg-primary-foreground/20 rounded-full absolute shadow-sm`} />
        {/* Inner orange circle */}
        <View className={`${currentSize.circle} bg-primary rounded-full items-center justify-center`}>
          <Text className={`${currentSize.text} font-black text-primary-foreground`}>
            M
          </Text>
        </View>
      </View>
      
      {/* o - White circle */}
      <View className={`${currentSize.circle} bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm -ml-2`}>
        <Text className={`${currentSize.text} font-bold text-primary`}>
          o
        </Text>
      </View>
      
      {/* i - White circle */}
      <View className={`${currentSize.circle} bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm -ml-2`}>
        <Text className={`${currentSize.text} font-bold text-primary`}>
          i
        </Text>
      </View>
      
      {/* m - White circle */}
      <View className={`${currentSize.circle} bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm -ml-2`}>
        <Text className={`${currentSize.text} font-bold text-primary`}>
          m
        </Text>
      </View>
    </View>
  );
}
