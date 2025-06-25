// Core Bible data types
export interface BibleVerse {
  number: number;
  text: string;
  usfmMarkers?: string[];
  footnotes?: Footnote[];
  crossReferences?: CrossReference[];
}

export interface BibleChapter {
  number: number;
  verses: BibleVerse[];
  title?: string;
  summary?: string;
}

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'old' | 'new';
  chapters: BibleChapter[];
  genre?: string;
  author?: string;
  writtenDate?: string;
  description?: string;
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  languageCode: string;
  description?: string;
  copyright?: string;
  publisher?: string;
  year?: number;
  books: BibleBook[];
}

export interface Footnote {
  id: string;
  verseId: string;
  marker: string;
  text: string;
  type: 'explanation' | 'translation' | 'textual' | 'reference';
}

export interface CrossReference {
  id: string;
  verseId: string;
  references: VerseReference[];
  description?: string;
}

export interface VerseReference {
  bookId: string;
  chapter: number;
  verse: number;
  endVerse?: number;
}

// Search related types
export interface SearchResult {
  verse: BibleVerse;
  book: BibleBook;
  chapter: BibleChapter;
  relevanceScore: number;
  highlightedText: string;
}

export interface SearchQuery {
  text: string;
  books?: string[];
  testament?: 'old' | 'new';
  exactMatch?: boolean;
  caseSensitive?: boolean;
  wholeWords?: boolean;
}

// User data types
export interface UserHighlight {
  id: string;
  verseId: string;
  color: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserNote {
  id: string;
  verseId?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFavorite {
  id: string;
  verseId: string;
  category?: string;
  createdAt: Date;
}

export interface ReadingHistory {
  id: string;
  bookId: string;
  chapter: number;
  verse?: number;
  timestamp: Date;
  duration?: number; // in seconds
}

// Reading plan types
export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  type: 'yearly' | 'topical' | 'chronological' | 'custom';
  duration: number; // in days
  readings: ReadingPlanDay[];
  createdAt: Date;
  isActive: boolean;
}

export interface ReadingPlanDay {
  day: number;
  readings: VerseReference[];
  title?: string;
  description?: string;
  completed?: boolean;
  completedAt?: Date;
}

// App settings types
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  lineHeight: number;
  defaultBibleVersion: string;
  parallelVersion?: string;
  enableParallelReading: boolean;
  enableVoiceNarration: boolean;
  dailyReminder: boolean;
  reminderTime?: string;
  language: string;
  autoSync: boolean;
}

// Quote creator types
export interface QuoteTemplate {
  id: string;
  name: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textStyle: TextStyle;
  layout: QuoteLayout;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  dropShadow?: DropShadow;
  outline?: TextOutline;
}

export interface DropShadow {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface TextOutline {
  color: string;
  width: number;
}

export interface QuoteLayout {
  format: 'mobile' | 'desktop' | 'square';
  width: number;
  height: number;
  padding: number;
  versePosition: 'top' | 'center' | 'bottom';
  referencePosition: 'below' | 'corner';
}

export interface GeneratedQuote {
  id: string;
  verseText: string;
  reference: string;
  template: QuoteTemplate;
  imageUrl: string;
  createdAt: Date;
}
