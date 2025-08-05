import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as ExpoLocation from 'expo-location';
import { Address } from './types';

export type PlaceType = "place" | "address" | "poi";

export interface MapBoxSuggestion {
  id: string;
  place_type: string[];
  address: Address;
}

interface LocationQueryOptions {
  placeType: PlaceType;
  countries: string[];
  limit?: number;
}

interface MapBoxApiResponse {
  features: {
    id: string;
    text: string;
    place_name: string;
    center: [number, number]; // [longitude, latitude]
    place_type: string[];
    context?: Array<{
      id: string;
      text: string;
    }>;
    properties?: {
      address?: string;
    }; 
  }[];
}

export function useLocationAPI(options: LocationQueryOptions) {
  const [query, setQuery] = useState('');
  const { placeType, countries, limit = 5 } = options;

  const fetchSuggestions = async (searchQuery: string): Promise<MapBoxSuggestion[]> => {
    if (!searchQuery.trim()) {
      return [];
    }

    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;
    if (!accessToken) {
      throw new Error('MapBox API key is not configured');
    }

    const params = new URLSearchParams({
      access_token: accessToken,
      limit: limit.toString(),
    });

    params.append("country", countries.join(","));
    params.append('types', placeType);

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${params}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`MapBox API error: ${response.statusText}`);
    }

    const data: MapBoxApiResponse = await response.json();
    
    const suggestions: MapBoxSuggestion[] = (data.features || []).map(feature => {
      const context = feature.context || [];
      
      const getContextValue = (types: string[]) => {
        const contextItem = context.find(item => 
          types.some(type => item.id?.startsWith(type))
        );
        return contextItem?.text || '';
      };

      return {
        id: feature.id,
        place_type: feature.place_type,
        address: {
          place_name: feature.place_name,
          address: feature.place_name,
          city: feature.text,
          state: getContextValue(['region']),
          postal_code: getContextValue(['postcode']),
          country: getContextValue(['country']),
          longitude: feature.center[0],
          latitude: feature.center[1],
        }
      };
    });

    return suggestions;
  };

  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['mapbox-suggestions', query, placeType, countries, limit],
    queryFn: () => fetchSuggestions(query),
    enabled: query.trim().length > 2, // Only search when query is at least 3 characters
  });

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    search,
    clearSearch,
    refetch,
  };
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<Address | null> {
  const reverseGeocode = await ExpoLocation.reverseGeocodeAsync({
    latitude,
    longitude,
  });

  if (reverseGeocode.length > 0) {
    const locationData = reverseGeocode[0];
    const reversedAddressData: Address = {
      place_name: `${locationData.city}, ${locationData.region}, ${locationData.country}`,
      address: locationData.street || '',
      city: locationData.city || '',
      state: locationData.region || '',
      postal_code: locationData.postalCode || '',
      country: locationData.country || '',
      longitude,
      latitude,
    };

    return reversedAddressData;
  }

  return null
}