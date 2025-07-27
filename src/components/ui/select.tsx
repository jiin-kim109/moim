import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  SafeAreaView,
  Pressable 
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Check } from '@lib/icons/Check';
import { cn } from '@lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: SelectOption | null;
  onValueChange?: (option: SelectOption) => void;
  placeholder?: string;
  options: SelectOption[];
  className?: string;
}

export function Select({ 
  value, 
  onValueChange, 
  placeholder = "Select an option",
  options,
  className 
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: SelectOption) => {
    onValueChange?.(option);
    setIsOpen(false);
  };

  const displayValue = value?.label || placeholder;

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={cn(
          'flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm native:text-base',
          className
        )}
      >
        <Text className={cn(
          'flex-1 text-sm native:text-base',
          value ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {displayValue}
        </Text>
        <ChevronDown size={16} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setIsOpen(false)}
        >
          <Pressable 
            className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 max-h-96"
            onPress={(e) => e.stopPropagation()}
          >
            <SafeAreaView>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    className="flex-row items-center px-4 py-3 border-b border-gray-100"
                  >
                    <Text className="flex-1 text-sm native:text-base text-gray-900">
                      {item.label}
                    </Text>
                    {value?.value === item.value && (
                      <Check size={16} className="text-orange-500" />
                    )}
                  </TouchableOpacity>
                )}
                className="max-h-80"
              />
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Legacy components for backward compatibility
export const SelectTrigger = ({ children, className, ...props }: any) => children;
export const SelectValue = ({ children, ...props }: any) => children;
export const SelectContent = ({ children, ...props }: any) => children;
export const SelectItem = ({ children, ...props }: any) => children; 