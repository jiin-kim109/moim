import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeForChatRoomList(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Today - show time
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (daysDiff === 1) {
    // Yesterday
    return 'Yesterday';
  } else if (daysDiff < 7) {
    // This week - show day name
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    // More than a week - show date
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
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