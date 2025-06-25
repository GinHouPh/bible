export * from './bible';

// Common utility types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Platform detection
export type Platform = 'web' | 'mobile' | 'desktop';

// Navigation types
export interface NavigationState {
  currentBook?: string;
  currentChapter?: number;
  currentVerse?: number;
  history: NavigationHistoryItem[];
}

export interface NavigationHistoryItem {
  bookId: string;
  chapter: number;
  verse?: number;
  timestamp: Date;
}

// Sync types
export interface SyncStatus {
  lastSync?: Date;
  isOnline: boolean;
  hasPendingChanges: boolean;
  syncInProgress: boolean;
}

export interface SyncableItem {
  id: string;
  lastModified: Date;
  synced: boolean;
  deleted?: boolean;
}
