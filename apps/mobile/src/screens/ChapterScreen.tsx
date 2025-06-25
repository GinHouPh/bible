import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useBibleStore, useUserStore, generateVerseId } from '@bible/shared';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChapterScreenRouteProp = RouteProp<RootStackParamList, 'Chapter'>;
type ChapterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chapter'>;

export default function ChapterScreen() {
  const navigation = useNavigation<ChapterScreenNavigationProp>();
  const route = useRoute<ChapterScreenRouteProp>();
  const { bookId, chapterNumber, bookName } = route.params;

  const { getChapter, navigateToVerse } = useBibleStore();
  const { 
    addToHistory, 
    getHighlight, 
    addHighlight, 
    removeHighlight,
    isFavorite,
    addFavorite,
    removeFavorite,
    settings 
  } = useUserStore();

  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const chapter = getChapter(bookId, chapterNumber);

  useEffect(() => {
    // Add to reading history
    addToHistory(bookId, chapterNumber);
  }, [bookId, chapterNumber, addToHistory]);

  const handleVersePress = (verseNumber: number) => {
    if (isSelectionMode) {
      toggleVerseSelection(verseNumber);
    } else {
      navigateToVerse(bookId, chapterNumber, verseNumber);
      navigation.navigate('Verse', {
        bookId,
        chapterNumber,
        verseNumber,
        bookName,
      });
    }
  };

  const handleVerseLongPress = (verseNumber: number) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedVerses([verseNumber]);
    } else {
      toggleVerseSelection(verseNumber);
    }
  };

  const toggleVerseSelection = (verseNumber: number) => {
    setSelectedVerses(prev => {
      if (prev.includes(verseNumber)) {
        return prev.filter(v => v !== verseNumber);
      } else {
        return [...prev, verseNumber].sort((a, b) => a - b);
      }
    });
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedVerses([]);
  };

  const handleHighlightSelected = () => {
    if (selectedVerses.length === 0) return;

    Alert.alert(
      'Highlight Verses',
      'Choose a highlight color:',
      [
        { text: 'Yellow', onPress: () => highlightVerses('#FFEB3B') },
        { text: 'Green', onPress: () => highlightVerses('#4CAF50') },
        { text: 'Blue', onPress: () => highlightVerses('#2196F3') },
        { text: 'Pink', onPress: () => highlightVerses('#E91E63') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const highlightVerses = (color: string) => {
    selectedVerses.forEach(verseNumber => {
      const verseId = generateVerseId(bookId, chapterNumber, verseNumber);
      const existingHighlight = getHighlight(verseId);
      
      if (existingHighlight) {
        removeHighlight(existingHighlight.id);
      }
      
      addHighlight(verseId, color);
    });
    
    exitSelectionMode();
  };

  const handleFavoriteSelected = () => {
    selectedVerses.forEach(verseNumber => {
      const verseId = generateVerseId(bookId, chapterNumber, verseNumber);
      
      if (isFavorite(verseId)) {
        removeFavorite(verseId);
      } else {
        addFavorite(verseId);
      }
    });
    
    exitSelectionMode();
  };

  const handleShareSelected = () => {
    if (selectedVerses.length === 0 || !chapter) return;

    const versesText = selectedVerses
      .map(verseNumber => {
        const verse = chapter.verses.find(v => v.number === verseNumber);
        return verse ? `${verseNumber} ${verse.text}` : '';
      })
      .filter(Boolean)
      .join(' ');

    const reference = selectedVerses.length === 1 
      ? `${bookName} ${chapterNumber}:${selectedVerses[0]}`
      : `${bookName} ${chapterNumber}:${selectedVerses[0]}-${selectedVerses[selectedVerses.length - 1]}`;

    const shareText = `"${versesText}"\n\n${reference}`;

    navigation.navigate('QuoteCreator', {
      verseText: versesText,
      reference,
    });
  };

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>Chapter Not Found</Text>
          <Text style={styles.emptyStateText}>
            This chapter could not be loaded.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={exitSelectionMode}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <Text style={styles.selectionTitle}>
            {selectedVerses.length} verse{selectedVerses.length !== 1 ? 's' : ''} selected
          </Text>
          
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={handleHighlightSelected}
            >
              <Ionicons name="color-palette" size={20} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={handleFavoriteSelected}
            >
              <Ionicons name="heart" size={20} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={handleShareSelected}
            >
              <Ionicons name="share" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chapter Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {chapter.title && (
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
        )}

        {chapter.verses.map((verse) => {
          const verseId = generateVerseId(bookId, chapterNumber, verse.number);
          const highlight = getHighlight(verseId);
          const isSelected = selectedVerses.includes(verse.number);
          const isFav = isFavorite(verseId);

          return (
            <TouchableOpacity
              key={verse.number}
              style={[
                styles.verseContainer,
                highlight && { backgroundColor: highlight.color + '40' },
                isSelected && styles.selectedVerse,
              ]}
              onPress={() => handleVersePress(verse.number)}
              onLongPress={() => handleVerseLongPress(verse.number)}
              activeOpacity={0.7}
            >
              <View style={styles.verseContent}>
                <Text style={styles.verseNumber}>{verse.number}</Text>
                <Text style={[
                  styles.verseText,
                  { fontSize: settings.fontSize, lineHeight: settings.fontSize * settings.lineHeight }
                ]}>
                  {verse.text}
                </Text>
                {isFav && (
                  <Ionicons 
                    name="heart" 
                    size={12} 
                    color="#FF3B30" 
                    style={styles.favoriteIcon}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionAction: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  verseContainer: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 8,
  },
  selectedVerse: {
    backgroundColor: '#007AFF20',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginRight: 8,
    marginTop: 2,
    minWidth: 20,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  favoriteIcon: {
    marginLeft: 8,
    marginTop: 4,
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
