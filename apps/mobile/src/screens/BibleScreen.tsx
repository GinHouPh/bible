import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useBibleStore, BOOK_NAMES, BIBLE_BOOKS_ORDER } from '@bible/shared';
import { RootStackParamList } from '../navigation/AppNavigator';

type BibleScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function BibleScreen() {
  const navigation = useNavigation<BibleScreenNavigationProp>();
  const { getCurrentVersion, navigateToBook } = useBibleStore();
  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new' | 'all'>('all');

  const currentVersion = getCurrentVersion();

  const getFilteredBooks = () => {
    if (!currentVersion) return [];

    return BIBLE_BOOKS_ORDER
      .map(bookId => {
        const bookInfo = BOOK_NAMES[bookId];
        const bookData = currentVersion.books.find(b => b.id === bookId);
        
        if (!bookData || !bookInfo) return null;

        return {
          id: bookId,
          name: bookInfo.name,
          abbreviation: bookInfo.abbreviation,
          testament: bookInfo.testament,
          chapters: bookData.chapters.length,
        };
      })
      .filter(book => {
        if (!book) return false;
        if (selectedTestament === 'all') return true;
        return book.testament === selectedTestament;
      });
  };

  const handleBookPress = (bookId: string, bookName: string) => {
    navigateToBook(bookId);
    navigation.navigate('Chapter', {
      bookId,
      chapterNumber: 1,
      bookName,
    });
  };

  const filteredBooks = getFilteredBooks();

  if (!currentVersion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No Bible Version</Text>
          <Text style={styles.emptyStateText}>
            Please download a Bible version to start reading.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{currentVersion.name}</Text>
        <Text style={styles.headerSubtitle}>{currentVersion.abbreviation}</Text>
      </View>

      {/* Testament Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedTestament === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedTestament('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedTestament === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All Books
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedTestament === 'old' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedTestament('old')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedTestament === 'old' && styles.filterButtonTextActive,
            ]}
          >
            Old Testament
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedTestament === 'new' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedTestament('new')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedTestament === 'new' && styles.filterButtonTextActive,
            ]}
          >
            New Testament
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.booksContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookCard}
            onPress={() => handleBookPress(item.id, item.name)}
          >
            <View style={styles.bookCardContent}>
              <Text style={styles.bookName}>{item.name}</Text>
              <Text style={styles.bookInfo}>
                {item.chapters} chapter{item.chapters !== 1 ? 's' : ''}
              </Text>
              <View style={styles.bookTestament}>
                <Text style={styles.bookTestamentText}>
                  {item.testament === 'old' ? 'OT' : 'NT'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  booksContainer: {
    padding: 16,
  },
  bookCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCardContent: {
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  bookInfo: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  bookTestament: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bookTestamentText: {
    fontSize: 10,
    fontWeight: '600',
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
