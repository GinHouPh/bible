import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useUserStore, useBibleStore, parseVerseId } from '@bible/shared';
import { RootStackParamList } from '../navigation/AppNavigator';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { favorites, removeFavorite } = useUserStore();
  const { getVerse } = useBibleStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(favorites.map(f => f.category).filter(Boolean)));
  
  // Filter favorites by category
  const filteredFavorites = selectedCategory 
    ? favorites.filter(f => f.category === selectedCategory)
    : favorites;

  const handleFavoritePress = (verseId: string) => {
    const verseInfo = parseVerseId(verseId);
    if (!verseInfo) return;

    navigation.navigate('Chapter', {
      bookId: verseInfo.bookId,
      chapterNumber: verseInfo.chapter,
      bookName: verseInfo.bookId, // This should be resolved to book name
    });
  };

  const handleRemoveFavorite = (verseId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this verse from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFavorite(verseId)
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: any }) => {
    const verseInfo = parseVerseId(item.verseId);
    if (!verseInfo) return null;

    const verse = getVerse(verseInfo.bookId, verseInfo.chapter, verseInfo.verse);
    if (!verse) return null;

    return (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => handleFavoritePress(item.verseId)}
      >
        <View style={styles.favoriteContent}>
          <View style={styles.favoriteHeader}>
            <Text style={styles.favoriteReference}>
              {verseInfo.bookId} {verseInfo.chapter}:{verseInfo.verse}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveFavorite(item.verseId)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="heart" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.favoriteText} numberOfLines={3}>
            {verse.text}
          </Text>
          
          {item.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          )}
          
          <Text style={styles.favoriteDate}>
            Added {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyStateText}>
            Tap the heart icon on any verse to add it to your favorites.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Category Filter */}
      {categories.length > 0 && (
        <View style={styles.categoryFilter}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === null && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === null && styles.categoryButtonTextActive,
            ]}>
              All ({favorites.length})
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}>
                {category} ({favorites.filter(f => f.category === category).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Favorites List */}
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  categoryFilter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  favoriteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  favoriteDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
});
