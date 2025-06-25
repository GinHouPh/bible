import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppSettings,
  UserHighlight,
  UserNote,
  UserFavorite,
  ReadingHistory,
  ReadingPlan,
  SyncStatus
} from '../types';
import { generateId } from '../utils';

interface UserState {
  // Settings
  settings: AppSettings;
  
  // User data
  highlights: UserHighlight[];
  notes: UserNote[];
  favorites: UserFavorite[];
  history: ReadingHistory[];
  readingPlans: ReadingPlan[];
  
  // Sync
  syncStatus: SyncStatus;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Highlight actions
  addHighlight: (verseId: string, color: string, note?: string) => void;
  updateHighlight: (id: string, updates: Partial<UserHighlight>) => void;
  removeHighlight: (id: string) => void;
  getHighlight: (verseId: string) => UserHighlight | null;
  
  // Note actions
  addNote: (title: string, content: string, verseId?: string, tags?: string[]) => void;
  updateNote: (id: string, updates: Partial<UserNote>) => void;
  removeNote: (id: string) => void;
  getNotesForVerse: (verseId: string) => UserNote[];
  searchNotes: (query: string) => UserNote[];
  
  // Favorite actions
  addFavorite: (verseId: string, category?: string) => void;
  removeFavorite: (verseId: string) => void;
  isFavorite: (verseId: string) => boolean;
  getFavoritesByCategory: (category?: string) => UserFavorite[];
  
  // History actions
  addToHistory: (bookId: string, chapter: number, verse?: number, duration?: number) => void;
  clearHistory: () => void;
  getRecentHistory: (limit?: number) => ReadingHistory[];
  
  // Reading plan actions
  addReadingPlan: (plan: Omit<ReadingPlan, 'id' | 'createdAt'>) => void;
  updateReadingPlan: (id: string, updates: Partial<ReadingPlan>) => void;
  removeReadingPlan: (id: string) => void;
  markReadingComplete: (planId: string, day: number) => void;
  getActiveReadingPlan: () => ReadingPlan | null;
  
  // Sync actions
  updateSyncStatus: (status: Partial<SyncStatus>) => void;
  markForSync: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  fontSize: 16,
  fontFamily: 'serif',
  lineHeight: 1.6,
  defaultBibleVersion: 'ESV',
  enableParallelReading: false,
  enableVoiceNarration: false,
  dailyReminder: false,
  language: 'en',
  autoSync: true
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      highlights: [],
      notes: [],
      favorites: [],
      history: [],
      readingPlans: [],
      syncStatus: {
        isOnline: true,
        hasPendingChanges: false,
        syncInProgress: false
      },
      
      // Settings actions
      updateSettings: (newSettings) => {
        const state = get();
        set({
          settings: { ...state.settings, ...newSettings },
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      resetSettings: () => {
        set({
          settings: defaultSettings,
          syncStatus: { ...get().syncStatus, hasPendingChanges: true }
        });
      },
      
      // Highlight actions
      addHighlight: (verseId, color, note) => {
        const state = get();
        const highlight: UserHighlight = {
          id: generateId(),
          verseId,
          color,
          note,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set({
          highlights: [...state.highlights, highlight],
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      updateHighlight: (id, updates) => {
        const state = get();
        const highlights = state.highlights.map(h =>
          h.id === id ? { ...h, ...updates, updatedAt: new Date() } : h
        );
        
        set({
          highlights,
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      removeHighlight: (id) => {
        const state = get();
        set({
          highlights: state.highlights.filter(h => h.id !== id),
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      getHighlight: (verseId) => {
        const state = get();
        return state.highlights.find(h => h.verseId === verseId) || null;
      },
      
      // Note actions
      addNote: (title, content, verseId, tags = []) => {
        const state = get();
        const note: UserNote = {
          id: generateId(),
          verseId,
          title,
          content,
          tags,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set({
          notes: [...state.notes, note],
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      updateNote: (id, updates) => {
        const state = get();
        const notes = state.notes.map(n =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
        );
        
        set({
          notes,
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      removeNote: (id) => {
        const state = get();
        set({
          notes: state.notes.filter(n => n.id !== id),
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      getNotesForVerse: (verseId) => {
        const state = get();
        return state.notes.filter(n => n.verseId === verseId);
      },
      
      searchNotes: (query) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return state.notes.filter(n =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.content.toLowerCase().includes(lowerQuery) ||
          n.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },
      
      // Favorite actions
      addFavorite: (verseId, category) => {
        const state = get();
        
        // Check if already favorited
        if (state.favorites.some(f => f.verseId === verseId)) return;
        
        const favorite: UserFavorite = {
          id: generateId(),
          verseId,
          category,
          createdAt: new Date()
        };
        
        set({
          favorites: [...state.favorites, favorite],
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      removeFavorite: (verseId) => {
        const state = get();
        set({
          favorites: state.favorites.filter(f => f.verseId !== verseId),
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      isFavorite: (verseId) => {
        const state = get();
        return state.favorites.some(f => f.verseId === verseId);
      },
      
      getFavoritesByCategory: (category) => {
        const state = get();
        return state.favorites.filter(f => f.category === category);
      },
      
      // History actions
      addToHistory: (bookId, chapter, verse, duration) => {
        const state = get();
        const historyItem: ReadingHistory = {
          id: generateId(),
          bookId,
          chapter,
          verse,
          timestamp: new Date(),
          duration
        };
        
        // Remove duplicate entries for the same verse
        const filteredHistory = state.history.filter(h =>
          !(h.bookId === bookId && h.chapter === chapter && h.verse === verse)
        );
        
        set({
          history: [historyItem, ...filteredHistory].slice(0, 1000), // Keep last 1000 items
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      clearHistory: () => {
        set({
          history: [],
          syncStatus: { ...get().syncStatus, hasPendingChanges: true }
        });
      },
      
      getRecentHistory: (limit = 10) => {
        const state = get();
        return state.history.slice(0, limit);
      },
      
      // Reading plan actions
      addReadingPlan: (planData) => {
        const state = get();
        const plan: ReadingPlan = {
          ...planData,
          id: generateId(),
          createdAt: new Date()
        };
        
        set({
          readingPlans: [...state.readingPlans, plan],
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      updateReadingPlan: (id, updates) => {
        const state = get();
        const readingPlans = state.readingPlans.map(p =>
          p.id === id ? { ...p, ...updates } : p
        );
        
        set({
          readingPlans,
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      removeReadingPlan: (id) => {
        const state = get();
        set({
          readingPlans: state.readingPlans.filter(p => p.id !== id),
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      markReadingComplete: (planId, day) => {
        const state = get();
        const readingPlans = state.readingPlans.map(plan => {
          if (plan.id === planId) {
            const readings = plan.readings.map(reading => {
              if (reading.day === day) {
                return {
                  ...reading,
                  completed: true,
                  completedAt: new Date()
                };
              }
              return reading;
            });
            return { ...plan, readings };
          }
          return plan;
        });
        
        set({
          readingPlans,
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      },
      
      getActiveReadingPlan: () => {
        const state = get();
        return state.readingPlans.find(p => p.isActive) || null;
      },
      
      // Sync actions
      updateSyncStatus: (status) => {
        const state = get();
        set({
          syncStatus: { ...state.syncStatus, ...status }
        });
      },
      
      markForSync: () => {
        const state = get();
        set({
          syncStatus: { ...state.syncStatus, hasPendingChanges: true }
        });
      }
    }),
    {
      name: 'user-store'
    }
  )
);
