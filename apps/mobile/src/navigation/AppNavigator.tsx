import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BibleScreen from '../screens/BibleScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChapterScreen from '../screens/ChapterScreen';
import VerseScreen from '../screens/VerseScreen';
import NotesScreen from '../screens/NotesScreen';
import ReadingPlansScreen from '../screens/ReadingPlansScreen';
import QuoteCreatorScreen from '../screens/QuoteCreatorScreen';

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Bible: undefined;
  Search: undefined;
  Favorites: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Chapter: {
    bookId: string;
    chapterNumber: number;
    bookName: string;
  };
  Verse: {
    bookId: string;
    chapterNumber: number;
    verseNumber: number;
    bookName: string;
  };
  Notes: {
    verseId?: string;
  };
  ReadingPlans: undefined;
  QuoteCreator: {
    verseId?: string;
    verseText?: string;
    reference?: string;
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Bible':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Bible" 
        component={BibleScreen}
        options={{ title: 'Bible' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Chapter" 
        component={ChapterScreen}
        options={({ route }) => ({
          title: `${route.params.bookName} ${route.params.chapterNumber}`,
        })}
      />
      <Stack.Screen 
        name="Verse" 
        component={VerseScreen}
        options={({ route }) => ({
          title: `${route.params.bookName} ${route.params.chapterNumber}:${route.params.verseNumber}`,
        })}
      />
      <Stack.Screen 
        name="Notes" 
        component={NotesScreen}
        options={{ title: 'Notes' }}
      />
      <Stack.Screen 
        name="ReadingPlans" 
        component={ReadingPlansScreen}
        options={{ title: 'Reading Plans' }}
      />
      <Stack.Screen 
        name="QuoteCreator" 
        component={QuoteCreatorScreen}
        options={{ title: 'Create Quote' }}
      />
    </Stack.Navigator>
  );
}
