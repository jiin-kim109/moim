import { useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { toast } from 'sonner-native';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const hasShownInitialStatus = useRef(false);
  const wasConnectedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected;
      const online = state.isInternetReachable;
      
      setIsConnected(connected);
      setIsOnline(online);

      // Don't show toast on initial load
      if (!hasShownInitialStatus.current) {
        hasShownInitialStatus.current = true;
        wasConnectedRef.current = connected;
        return;
      }

      // Show toast when connection status changes
      if (wasConnectedRef.current !== null && wasConnectedRef.current !== connected) {
        if (connected === false) {
          toast('📶 No internet connection', {
            description: 'Check your network settings and try again',
            duration: 4000,
            style: {
              backgroundColor: '#374151', // gray-700
              borderColor: '#4B5563', // gray-600
            },
          });
        } else if (connected === true && wasConnectedRef.current === false) {
          toast('✅ Network connected', {
            description: 'Internet connection restored',
            duration: 2000,
            style: {
              backgroundColor: '#059669', // emerald-600
              borderColor: '#10B981', // emerald-500
            },
          });
        }
      }

      wasConnectedRef.current = connected;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isOnline,
    isOffline: isConnected === false,
  };
};
