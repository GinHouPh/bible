import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useBibleStore, useUserStore, formatDate } from '@bible/shared';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { currentBook, currentChapter, currentVerse, getCurrentBook } = useBibleStore();
  const { getRecentHistory, getActiveReadingPlan } = useUserStore();

  const recentHistory = getRecentHistory(5);
  const activeReadingPlan = getActiveReadingPlan();
  const currentBookData = getCurrentBook();

  const handleContinueReading = () => {
    if (currentBook && currentChapter) {
      navigation.navigate('Chapter', {
        bookId: currentBook,
        chapterNumber: currentChapter,
        bookName: currentBookData?.name || currentBook,
      });
    } else {
      // Navigate to Bible screen to select a book
      navigation.navigate('MainTabs');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'search':
        navigation.navigate('MainTabs');
        break;
      case 'favorites':
        navigation.navigate('MainTabs');
        break;
      case 'notes':
        navigation.navigate('Notes', {});
        break;
      case 'plans':
        navigation.navigate('ReadingPlans');
        break;
      case 'quote':
        navigation.navigate('QuoteCreator', {});
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.date}>{formatDate(new Date(), 'long')}</Text>
        </View>

        {/* Continue Reading Card */}
        <TouchableOpacity style={styles.continueCard} onPress={handleContinueReading}>
          <View style={styles.continueCardHeader}>
            <Ionicons name="book-outline" size={24} color="#007AFF" />
            <Text style={styles.continueCardTitle}>Continue Reading</Text>
          </View>
          {currentBook && currentChapter ? (
            <View>
              <Text style={styles.continueCardText}>
                {currentBookData?.name || currentBook} {currentChapter}
                {currentVerse ? `:${currentVerse}` : ''}
              </Text>
              <Text style={styles.continueCardSubtext}>
                Pick up where you left off
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.continueCardText}>Start Reading</Text>
              <Text style={styles.continueCardSubtext}>
                Begin your Bible study journey
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Reading Plan Card */}
        {activeReadingPlan && (
          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#34C759" />
              <Text style={styles.planCardTitle}>{activeReadingPlan.name}</Text>
            </View>
            <Text style={styles.planCardDescription}>
              {activeReadingPlan.description}
            </Text>
            <View style={styles.planProgress}>
              <Text style={styles.planProgressText}>
                Day {activeReadingPlan.readings.filter(r => r.completed).length + 1} of {activeReadingPlan.duration}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('search')}
            >
              <Ionicons name="search" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('favorites')}
            >
              <Ionicons name="heart" size={24} color="#FF3B30" />
              <Text style={styles.actionText}>Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('notes')}
            >
              <Ionicons name="document-text" size={24} color="#FF9500" />
              <Text style={styles.actionText}>Notes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('plans')}
            >
              <Ionicons name="calendar" size={24} color="#34C759" />
              <Text style={styles.actionText}>Plans</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('quote')}
            >
              <Ionicons name="image" size={24} color="#AF52DE" />
              <Text style={styles.actionText}>Quote</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent History */}
        {recentHistory.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Reading</Text>
            {recentHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => {
                  navigation.navigate('Chapter', {
                    bookId: item.bookId,
                    chapterNumber: item.chapter,
                    bookName: item.bookId, // This should be resolved to book name
                  });
                }}
              >
                <View style={styles.historyItemContent}>
                  <Text style={styles.historyItemTitle}>
                    {item.bookId} {item.chapter}
                    {item.verse ? `:${item.verse}` : ''}
                  </Text>
                  <Text style={styles.historyItemTime}>
                    {formatDate(item.timestamp, 'time')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Verse of the Day */}
        <View style={styles.verseCard}>
          <Text style={styles.verseCardTitle}>Verse of the Day</Text>
          <Text style={styles.verseText}>
            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future."
          </Text>
          <Text style={styles.verseReference}>Jeremiah 29:11</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#8E8E93',
  },
  continueCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  continueCardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  continueCardSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  planCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  planCardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  planProgress: {
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
  },
  planProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#34C759',
  },
  quickActions: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginTop: 8,
  },
  recentSection: {
    margin: 20,
    marginTop: 0,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  historyItemTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  verseCard: {
    backgroundColor: '#007AFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  verseCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  verseText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  verseReference: {
    fontSize: 14,
    color: '#B3D9FF',
    fontWeight: '500',
  },
});
