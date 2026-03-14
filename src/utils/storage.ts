import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    // Auth tokens
    setToken: async (token: string): Promise<void> => {
        try {
            await AsyncStorage.setItem('token', token);
        } catch (error) {
            console.error('Error saving token:', error);
        }
    },

    getToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem('token');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    removeToken: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem('token');
        } catch (error) {
            console.error('Error removing token:', error);
        }
    },

    // User data
    setUser: async (user: any): Promise<void> => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user:', error);
        }
    },

    getUser: async <T = any>(): Promise<T | null> => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    removeUser: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error('Error removing user:', error);
        }
    },

    // Generic storage
    set: async <T>(key: string, value: T): Promise<void> => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    },

    get: async <T = any>(key: string): Promise<T | null> => {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return null;
        }
    },

    remove: async (key: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
        }
    },

    clear: async (): Promise<void> => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    },

    // Multi-get for performance
    getMultiple: async (keys: string[]): Promise<[string, any][]> => {
        try {
            const result = await AsyncStorage.multiGet(keys);
            return result.map(([key, value]) => [key, value ? JSON.parse(value) : null]);
        } catch (error) {
            console.error('Error getting multiple items:', error);
            return [];
        }
    },
};