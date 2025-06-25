import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BibleVersion,
  BibleBook,
  BibleChapter,
  BibleVerse,
  SearchResult,
  SearchQuery,
  NavigationState,
  LoadingState
} from '../types';

interface BibleState {
  // Bible data
  versions: BibleVersion[];
  currentVersion: string | null;
  currentBook: string | null;
  currentChapter: number | null;
  currentVerse: number | null;
  
  // Navigation
  navigation: NavigationState;
  
  // Search
  searchResults: SearchResult[];
  searchQuery: string;
  searchLoading: boolean;
  
  // Loading states
  loadingStates: Record<string, LoadingState>;
  
  // Actions
  setVersions: (versions: BibleVersion[]) => void;
  setCurrentVersion: (versionId: string) => void;
  navigateToVerse: (bookId: string, chapter: number, verse?: number) => void;
  navigateToChapter: (bookId: string, chapter: number) => void;
  navigateToBook: (bookId: string) => void;
  goBack: () => void;
  goForward: () => void;
  
  // Search actions
  searchBible: (query: SearchQuery) => Promise<void>;
  clearSearch: () => void;
  
  // Data getters
  getCurrentVersion: () => BibleVersion | null;
  getCurrentBook: () => BibleBook | null;
  getCurrentChapter: () => BibleChapter | null;
  getCurrentVerse: () => BibleVerse | null;
  getBook: (bookId: string) => BibleBook | null;
  getChapter: (bookId: string, chapterNumber: number) => BibleChapter | null;
  getVerse: (bookId: string, chapter: number, verse: number) => BibleVerse | null;
  
  // Loading state management
  setLoading: (key: string, loading: boolean, error?: string) => void;
  getLoadingState: (key: string) => LoadingState;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set, get) => ({
      // Initial state
      versions: [],
      currentVersion: null,
      currentBook: null,
      currentChapter: null,
      currentVerse: null,
      
      navigation: {
        history: []
      },
      
      searchResults: [],
      searchQuery: '',
      searchLoading: false,
      
      loadingStates: {},
      
      // Actions
      setVersions: (versions) => set({ versions }),
      
      setCurrentVersion: (versionId) => set({ currentVersion: versionId }),
      
      navigateToVerse: (bookId, chapter, verse) => {
        const state = get();
        const historyItem = {
          bookId,
          chapter,
          verse,
          timestamp: new Date()
        };
        
        set({
          currentBook: bookId,
          currentChapter: chapter,
          currentVerse: verse,
          navigation: {
            ...state.navigation,
            history: [...state.navigation.history, historyItem].slice(-50) // Keep last 50 items
          }
        });
      },
      
      navigateToChapter: (bookId, chapter) => {
        get().navigateToVerse(bookId, chapter, 1);
      },
      
      navigateToBook: (bookId) => {
        get().navigateToVerse(bookId, 1, 1);
      },
      
      goBack: () => {
        const state = get();
        const history = state.navigation.history;
        if (history.length > 1) {
          const previousItem = history[history.length - 2];
          set({
            currentBook: previousItem.bookId,
            currentChapter: previousItem.chapter,
            currentVerse: previousItem.verse,
            navigation: {
              ...state.navigation,
              history: history.slice(0, -1)
            }
          });
        }
      },
      
      goForward: () => {
        // Implementation would require forward history tracking
        // For now, this is a placeholder
      },
      
      searchBible: async (query) => {
        set({ searchLoading: true, searchQuery: query.text });
        
        try {
          const state = get();
          const currentVersion = state.getCurrentVersion();
          
          if (!currentVersion) {
            throw new Error('No Bible version selected');
          }
          
          // Simple search implementation
          // In a real app, this would use a proper search index
          const results: SearchResult[] = [];
          
          for (const book of currentVersion.books) {
            // Skip books not in query filter
            if (query.books && !query.books.includes(book.id)) continue;
            if (query.testament && book.testament !== query.testament) continue;
            
            for (const chapter of book.chapters) {
              for (const verse of chapter.verses) {
                const searchText = query.caseSensitive ? verse.text : verse.text.toLowerCase();
                const queryText = query.caseSensitive ? query.text : query.text.toLowerCase();
                
                let matches = false;
                
                if (query.exactMatch) {
                  matches = searchText === queryText;
                } else if (query.wholeWords) {
                  const regex = new RegExp(`\\b${queryText}\\b`, query.caseSensitive ? 'g' : 'gi');
                  matches = regex.test(searchText);
                } else {
                  matches = searchText.includes(queryText);
                }
                
                if (matches) {
                  // Simple relevance scoring
                  const relevanceScore = searchText.split(queryText).length - 1;
                  
                  // Highlight matched text
                  const highlightedText = verse.text.replace(
                    new RegExp(query.text, query.caseSensitive ? 'g' : 'gi'),
                    '<mark>$&</mark>'
                  );
                  
                  results.push({
                    verse,
                    book,
                    chapter,
                    relevanceScore,
                    highlightedText
                  });
                }
              }
            }
          }
          
          // Sort by relevance score (descending)
          results.sort((a, b) => b.relevanceScore - a.relevanceScore);
          
          set({ searchResults: results, searchLoading: false });
        } catch (error) {
          console.error('Search error:', error);
          set({ searchResults: [], searchLoading: false });
        }
      },
      
      clearSearch: () => set({ searchResults: [], searchQuery: '', searchLoading: false }),
      
      // Data getters
      getCurrentVersion: () => {
        const state = get();
        return state.versions.find(v => v.id === state.currentVersion) || null;
      },
      
      getCurrentBook: () => {
        const state = get();
        const version = state.getCurrentVersion();
        if (!version || !state.currentBook) return null;
        return version.books.find(b => b.id === state.currentBook) || null;
      },
      
      getCurrentChapter: () => {
        const state = get();
        const book = state.getCurrentBook();
        if (!book || !state.currentChapter) return null;
        return book.chapters.find(c => c.number === state.currentChapter) || null;
      },
      
      getCurrentVerse: () => {
        const state = get();
        const chapter = state.getCurrentChapter();
        if (!chapter || !state.currentVerse) return null;
        return chapter.verses.find(v => v.number === state.currentVerse) || null;
      },
      
      getBook: (bookId) => {
        const state = get();
        const version = state.getCurrentVersion();
        if (!version) return null;
        return version.books.find(b => b.id === bookId) || null;
      },
      
      getChapter: (bookId, chapterNumber) => {
        const state = get();
        const book = state.getBook(bookId);
        if (!book) return null;
        return book.chapters.find(c => c.number === chapterNumber) || null;
      },
      
      getVerse: (bookId, chapter, verse) => {
        const state = get();
        const chapterData = state.getChapter(bookId, chapter);
        if (!chapterData) return null;
        return chapterData.verses.find(v => v.number === verse) || null;
      },
      
      // Loading state management
      setLoading: (key, loading, error) => {
        const state = get();
        set({
          loadingStates: {
            ...state.loadingStates,
            [key]: { isLoading: loading, error }
          }
        });
      },
      
      getLoadingState: (key) => {
        const state = get();
        return state.loadingStates[key] || { isLoading: false };
      }
    }),
    {
      name: 'bible-store',
      partialize: (state) => ({
        currentVersion: state.currentVersion,
        currentBook: state.currentBook,
        currentChapter: state.currentChapter,
        currentVerse: state.currentVerse,
        navigation: state.navigation
      })
    }
  )
);
