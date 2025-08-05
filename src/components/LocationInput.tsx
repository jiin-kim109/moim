import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Input, InputProps } from "./ui/input";
import { useLocationAPI, PlaceType, MapBoxSuggestion, reverseGeocode } from "@hooks/useLocationAPI";
import { Address } from "@hooks/types";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import * as ExpoLocation from 'expo-location';

type LocationInputProps = Omit<InputProps, 'value' | 'onChangeText'> & {
  value: Address | null;
  onLocationChange: (location: Address | null) => void;
  disabled?: boolean;
  placeType: PlaceType;
  limit?: number;
  countries?: string[];
  autoFillCurrentLocation?: boolean;
}

export default function LocationInput({
  value,
  onLocationChange,
  disabled = false,
  placeType = "place",
  limit = 5,
  countries = ["us", "ca"],
  autoFillCurrentLocation = false,
  placeholder = "Search location",
  className,
  ...props
}: LocationInputProps) {
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  const { suggestions, search, clearSearch } = useLocationAPI({
    placeType,
    countries,
    limit,
  });

  // Update searchText when value changes externally
  useEffect(() => {
    if (value?.place_name) {
      setSearchText(value.place_name);
    }
  }, [value]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await ExpoLocation.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const reversedAddress = await reverseGeocode(latitude, longitude);
        if (reversedAddress) {
          onLocationChange(reversedAddress);
        }
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleFocus = async () => {
    if (
      autoFillCurrentLocation &&
      !hasCheckedPermission &&
      !disabled &&
      !value
    ) {
      setHasCheckedPermission(true);
      await getCurrentLocation();
    }
  };

  const handleLocationSelect = (suggestion: MapBoxSuggestion) => {
    const selectedAddress = suggestion.address;
    onLocationChange(selectedAddress);
    setSearchText(selectedAddress.place_name || "");
    setShowSuggestions(false);
    clearSearch();
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    setShowSuggestions(true);
    if (text !== value?.place_name) {
      onLocationChange(null);
      search(text);
    }
  };

  const handleInputBlur = () => {
    // Add a small delay to allow the suggestion click to register
    setTimeout(() => {
      setShowSuggestions(false);
      // Roll back to current value if no selection was made
      if (value?.place_name) {
        setSearchText(value.place_name);
      } else {
        setSearchText("");
      }
    }, 200);
  };

  return (
    <View style={styles.container}>
      <Input
        value={searchText}
        onChangeText={handleSearchTextChange}
        placeholder={placeholder}
        editable={!disabled}
        onBlur={handleInputBlur}
        onFocus={handleFocus}
        className={className}
        {...props}
      />
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.id}
                style={styles.suggestionItem}
                onPress={() => handleLocationSelect(suggestion)}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text style={styles.suggestionText}>
                  {suggestion.address.place_name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 200,
    zIndex: 2,
  },
  suggestionsScroll: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
}); 