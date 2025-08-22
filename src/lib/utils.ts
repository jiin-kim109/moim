import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useRef } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeForChatRoomList(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Today - show time like "2:35 AM"
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (daysDiff === 1) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
  };
}

export function useDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 1000
): T {
  const isExecutingRef = useRef(false);
  
  return ((...args: Parameters<T>) => {
    if (isExecutingRef.current) {
      return;
    }
    
    isExecutingRef.current = true;
    func(...args);
    
    setTimeout(() => {
      isExecutingRef.current = false;
    }, delay);
  }) as T;
}

export function getEnvironment(): 'production' | 'development' {
  if (process.env.EXPO_PUBLIC_ENV !== 'production' && process.env.EXPO_PUBLIC_ENV !== 'development') {
    throw new Error('EXPO_PUBLIC_ENV is not set');
  }
  return process.env.EXPO_PUBLIC_ENV as 'production' | 'development';
}