import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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