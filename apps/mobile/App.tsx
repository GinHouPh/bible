import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useUserStore, useBibleStore } from '@bible/shared';
import { initializeApp } from './src/utils/initialization';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { settings } = useUserStore();
  const { setVersions } = useBibleStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await initializeApp();
        
        // Load sample Bible data for development
        // In production, this would load from actual Bible files
        const sampleVersion = {
          id: 'ESV',
          name: 'English Standard Version',
          abbreviation: 'ESV',
          language: 'English',
          languageCode: 'en',
          books: [
            {
              id: 'gen',
              name: 'Genesis',
              abbreviation: 'Gen',
              testament: 'old' as const,
              chapters: [
                {
                  number: 1,
                  verses: [
                    {
                      number: 1,
                      text: 'In the beginning, God created the heavens and the earth.'
                    },
                    {
                      number: 2,
                      text: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.'
                    }
                  ]
                }
              ]
            }
          ]
        };
        
        setVersions([sampleVersion]);
        setError(null);
      } catch (err) {
        console.error('App initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [setVersions]);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Bible App...</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
