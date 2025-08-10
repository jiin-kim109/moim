import React from 'react';
import { Image as ExpoImage } from 'expo-image';
import { cssInterop } from 'nativewind';
import { cn } from '@lib/utils';

// Enable CSS interop for expo-image
cssInterop(ExpoImage, { className: "style" });

interface ImageProps extends React.ComponentProps<typeof ExpoImage> {
  className?: string;
}

function Image({ className, ...props }: ImageProps) {
  return (
    <ExpoImage
      className={cn(className)}
      contentFit="cover"
      cachePolicy="memory-disk"
      {...props}
    />
  );
}

export { Image };
