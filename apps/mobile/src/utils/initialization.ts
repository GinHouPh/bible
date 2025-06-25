import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@bible/shared';

/**
 * Initialize the mobile app
 */
export async function initializeApp(): Promise<void> {
  try {
    // Initialize user settings
    await initializeUserSettings();
    
    // Initialize database
    await initializeDatabase();
    
    // Load cached Bible data
    await loadCachedBibleData();
    
    console.log('Mobile app initialized successfully');
  } catch (error) {
    console.error('Failed to initialize mobile app:', error);
    throw error;
  }
}

/**
 * Initialize user settings from AsyncStorage
 */
async function initializeUserSettings(): Promise<void> {
  try {
    const settingsJson = await AsyncStorage.getItem('user-settings');
    
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      
      // Update the store with loaded settings
      const { updateSettings } = useUserStore.getState();
      updateSettings(settings);
    }
  } catch (error) {
    console.warn('Failed to load user settings:', error);
    // Continue with default settings
  }
}

/**
 * Initialize database for mobile
 */
async function initializeDatabase(): Promise<void> {
  try {
    // For React Native, we'll use AsyncStorage as a simple key-value store
    // In a production app, you might want to use SQLite
    
    // Check if database is already initialized
    const dbInitialized = await AsyncStorage.getItem('db-initialized');
    
    if (!dbInitialized) {
      // Create initial database structure
      await AsyncStorage.setItem('db-initialized', 'true');
      await AsyncStorage.setItem('bible-versions', JSON.stringify([]));
      await AsyncStorage.setItem('user-highlights', JSON.stringify([]));
      await AsyncStorage.setItem('user-notes', JSON.stringify([]));
      await AsyncStorage.setItem('user-favorites', JSON.stringify([]));
      await AsyncStorage.setItem('reading-history', JSON.stringify([]));
      await AsyncStorage.setItem('reading-plans', JSON.stringify([]));
      
      console.log('Database initialized');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Load cached Bible data
 */
async function loadCachedBibleData(): Promise<void> {
  try {
    // Load Bible versions from cache
    const versionsJson = await AsyncStorage.getItem('bible-versions');
    
    if (versionsJson) {
      const versions = JSON.parse(versionsJson);
      console.log(`Loaded ${versions.length} Bible versions from cache`);
    }
  } catch (error) {
    console.warn('Failed to load cached Bible data:', error);
    // Continue without cached data
  }
}

/**
 * Save data to AsyncStorage
 */
export async function saveToStorage(key: string, data: any): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
  } catch (error) {
    console.error(`Failed to save data to storage (${key}):`, error);
    throw error;
  }
}

/**
 * Load data from AsyncStorage
 */
export async function loadFromStorage<T>(key: string): Promise<T | null> {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    
    if (jsonData) {
      return JSON.parse(jsonData) as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to load data from storage (${key}):`, error);
    return null;
  }
}

/**
 * Clear all app data
 */
export async function clearAppData(): Promise<void> {
  try {
    const keys = [
      'user-settings',
      'bible-versions',
      'user-highlights',
      'user-notes',
      'user-favorites',
      'reading-history',
      'reading-plans',
      'db-initialized'
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log('App data cleared');
  } catch (error) {
    console.error('Failed to clear app data:', error);
    throw error;
  }
}
