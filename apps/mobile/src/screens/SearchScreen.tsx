import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useBibleStore, SearchQuery } from '@bible/shared';
import { RootStackParamList } from '../navigation/AppNavigator';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { searchBible, searchResults, searchLoading, clearSearch } = useBibleStore();
  
  const [searchText, setSearchText] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    exactMatch: false,
    caseSensitive: false,
    wholeWords: false,
  });

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    const query: SearchQuery = {
      text: searchText.trim(),
      exactMatch: searchFilters.exactMatch,
      caseSensitive: searchFilters.caseSensitive,
      wholeWords: searchFilters.wholeWords,
    };

    await searchBible(query);
  };

  const handleClearSearch = () => {
    setSearchText('');
    clearSearch();
  };

  const handleResultPress = (result: any) => {
    navigation.navigate('Chapter', {
      bookId: result.book.id,
      chapterNumber: result.chapter.number,
      bookName: result.book.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search the Bible..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Search Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            searchFilters.exactMatch && styles.filterChipActive,
          ]}
          onPress={() => setSearchFilters(prev => ({ ...prev, exactMatch: !prev.exactMatch }))}
        >
          <Text style={[
            styles.filterChipText,
            searchFilters.exactMatch && styles.filterChipTextActive,
          ]}>
            Exact Match
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterChip,
            searchFilters.wholeWords && styles.filterChipActive,
          ]}
          onPress={() => setSearchFilters(prev => ({ ...prev, wholeWords: !prev.wholeWords }))}
        >
          <Text style={[
            styles.filterChipText,
            searchFilters.wholeWords && styles.filterChipTextActive,
          ]}>
            Whole Words
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterChip,
            searchFilters.caseSensitive && styles.filterChipActive,
          ]}
          onPress={() => setSearchFilters(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
        >
          <Text style={[
            styles.filterChipText,
            searchFilters.caseSensitive && styles.filterChipTextActive,
          ]}>
            Case Sensitive
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searchLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.book.id}-${item.chapter.number}-${item.verse.number}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleResultPress(item)}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultReference}>
                  {item.book.name} {item.chapter.number}:{item.verse.number}
                </Text>
                <Text style={styles.resultScore}>
                  Score: {item.relevanceScore}
                </Text>
              </View>
              <Text 
                style={styles.resultText}
                dangerouslySetInnerHTML={{ __html: item.highlightedText }}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : searchText.length > 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search terms or filters.
          </Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>Search the Bible</Text>
          <Text style={styles.emptyStateText}>
            Enter keywords to find verses across all books.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  resultsContainer: {
    padding: 16,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  resultScore: {
    fontSize: 12,
    color: '#8E8E93',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
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
