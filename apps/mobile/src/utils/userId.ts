import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@bcv_user_id';

/**
 * Get or create a unique device-based user ID
 * This persists across app sessions but is device-specific
 */
export async function getUserId(): Promise<string> {
  let userId = await AsyncStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // Generate UUID v4
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    await AsyncStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}
