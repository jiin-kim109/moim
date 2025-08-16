import { ChatMessage } from '@hooks/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const localStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  async getHiddenMessageIds(chatroomId: string): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(`hiddenMessageIds_${chatroomId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting deleted message IDs from localStorage:', error);
      return [];
    }
  },

  async addHiddenMessageId(chatroomId: string, messageId: string): Promise<void> {
    try {
      const existingIds = await this.getHiddenMessageIds(chatroomId);
      const updatedIds = [...new Set([...existingIds, messageId])];
      await AsyncStorage.setItem(`hiddenMessageIds_${chatroomId}`, JSON.stringify(updatedIds));
    } catch (error) {
      console.error('Error adding deleted message ID to localStorage:', error);
    }
  },
};

export default localStorage;
