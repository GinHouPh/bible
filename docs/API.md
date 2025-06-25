# API Documentation

This document describes the internal APIs and interfaces used throughout the Bible App.

## Core Types

### Bible Data Types

#### BibleVersion
```typescript
interface BibleVersion {
  id: string;                    // Unique identifier (e.g., "ESV", "NIV")
  name: string;                  // Full name (e.g., "English Standard Version")
  abbreviation: string;          // Short name (e.g., "ESV")
  language: string;              // Language name (e.g., "English")
  languageCode: string;          // ISO language code (e.g., "en")
  description?: string;          // Version description
  copyright?: string;            // Copyright information
  publisher?: string;            // Publisher name
  year?: number;                 // Publication year
  books: BibleBook[];           // Array of books
}
```

#### BibleBook
```typescript
interface BibleBook {
  id: string;                    // Book identifier (e.g., "gen", "mat")
  name: string;                  // Book name (e.g., "Genesis")
  abbreviation: string;          // Book abbreviation (e.g., "Gen")
  testament: 'old' | 'new';      // Testament classification
  chapters: BibleChapter[];      // Array of chapters
  genre?: string;                // Book genre
  author?: string;               // Traditional author
  writtenDate?: string;          // Approximate writing date
  description?: string;          // Book description
}
```

#### BibleChapter
```typescript
interface BibleChapter {
  number: number;                // Chapter number
  verses: BibleVerse[];          // Array of verses
  title?: string;                // Chapter title
  summary?: string;              // Chapter summary
}
```

#### BibleVerse
```typescript
interface BibleVerse {
  number: number;                // Verse number
  text: string;                  // Verse text
  usfmMarkers?: string[];        // Original USFM markers
  footnotes?: Footnote[];        // Associated footnotes
  crossReferences?: CrossReference[]; // Cross-references
}
```

### User Data Types

#### UserHighlight
```typescript
interface UserHighlight {
  id: string;                    // Unique identifier
  verseId: string;               // Referenced verse ID
  color: string;                 // Highlight color (hex)
  note?: string;                 // Optional note
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

#### UserNote
```typescript
interface UserNote {
  id: string;                    // Unique identifier
  verseId?: string;              // Optional verse reference
  title: string;                 // Note title
  content: string;               // Note content (markdown)
  tags: string[];                // Categorization tags
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

#### UserFavorite
```typescript
interface UserFavorite {
  id: string;                    // Unique identifier
  verseId: string;               // Referenced verse ID
  category?: string;             // Optional category
  createdAt: Date;               // Creation timestamp
}
```

#### ReadingPlan
```typescript
interface ReadingPlan {
  id: string;                    // Unique identifier
  name: string;                  // Plan name
  description: string;           // Plan description
  type: 'yearly' | 'topical' | 'chronological' | 'custom';
  duration: number;              // Duration in days
  readings: ReadingPlanDay[];    // Daily readings
  createdAt: Date;               // Creation timestamp
  isActive: boolean;             // Whether plan is active
}
```

## State Management APIs

### Bible Store

#### useBibleStore
```typescript
interface BibleState {
  // Data
  versions: BibleVersion[];
  currentVersion: string | null;
  currentBook: string | null;
  currentChapter: number | null;
  currentVerse: number | null;
  
  // Search
  searchResults: SearchResult[];
  searchQuery: string;
  searchLoading: boolean;
  
  // Actions
  setVersions: (versions: BibleVersion[]) => void;
  setCurrentVersion: (versionId: string) => void;
  navigateToVerse: (bookId: string, chapter: number, verse?: number) => void;
  searchBible: (query: SearchQuery) => Promise<void>;
  
  // Getters
  getCurrentVersion: () => BibleVersion | null;
  getCurrentBook: () => BibleBook | null;
  getCurrentChapter: () => BibleChapter | null;
  getVerse: (bookId: string, chapter: number, verse: number) => BibleVerse | null;
}
```

### User Store

#### useUserStore
```typescript
interface UserState {
  // Settings
  settings: AppSettings;
  
  // User data
  highlights: UserHighlight[];
  notes: UserNote[];
  favorites: UserFavorite[];
  history: ReadingHistory[];
  readingPlans: ReadingPlan[];
  
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  addHighlight: (verseId: string, color: string, note?: string) => void;
  addNote: (title: string, content: string, verseId?: string) => void;
  addFavorite: (verseId: string, category?: string) => void;
  
  // Getters
  getHighlight: (verseId: string) => UserHighlight | null;
  getNotesForVerse: (verseId: string) => UserNote[];
  isFavorite: (verseId: string) => boolean;
}
```

## Database APIs

### BibleDatabase

#### Constructor
```typescript
constructor(config: DatabaseConfig = {})

interface DatabaseConfig {
  wasmUrl?: string;              // SQL.js WASM file URL
  databasePath?: string;         // Database file path (desktop)
  enableFTS?: boolean;           // Enable full-text search
}
```

#### Methods

##### initialize()
```typescript
async initialize(): Promise<void>
```
Initialize the database connection and schema.

##### saveBibleVersion()
```typescript
async saveBibleVersion(version: BibleVersion): Promise<void>
```
Save a complete Bible version to the database.

##### getBibleVersion()
```typescript
async getBibleVersion(versionId: string): Promise<BibleVersion | null>
```
Retrieve a Bible version by ID.

##### searchVerses()
```typescript
async searchVerses(query: SearchQuery): Promise<SearchResult[]>

interface SearchQuery {
  text: string;                  // Search text
  books?: string[];              // Limit to specific books
  testament?: 'old' | 'new';     // Limit to testament
  exactMatch?: boolean;          // Exact vs partial match
  caseSensitive?: boolean;       // Case sensitivity
  wholeWords?: boolean;          // Whole word matching
}
```

##### saveUserSettings()
```typescript
async saveUserSettings(settings: AppSettings): Promise<void>
```

##### getUserSettings()
```typescript
async getUserSettings(): Promise<AppSettings | null>
```

## USFM Parser APIs

### USFMParser

#### parseUSFM()
```typescript
parseUSFM(usfmText: string, versionInfo: Partial<BibleVersion>): BibleVersion
```
Parse USFM text into a structured BibleVersion object.

**Parameters:**
- `usfmText`: Raw USFM content
- `versionInfo`: Metadata about the Bible version

**Returns:** Complete BibleVersion object

#### Supported USFM Markers

| Marker | Description | Example |
|--------|-------------|---------|
| `\id` | Book identification | `\id GEN English Standard Version` |
| `\h` | Running header | `\h Genesis` |
| `\toc1` | Long table of contents | `\toc1 The First Book of Moses` |
| `\toc2` | Short table of contents | `\toc2 Genesis` |
| `\toc3` | Abbreviation | `\toc3 Gen` |
| `\mt` | Main title | `\mt1 GENESIS` |
| `\c` | Chapter number | `\c 1` |
| `\v` | Verse number | `\v 1 In the beginning...` |
| `\p` | Paragraph | `\p` |
| `\q` | Poetry/quotation | `\q1 The Lord is my shepherd` |
| `\f` | Footnote | `\f + \fr 1:1 \ft Or beginning\f*` |
| `\x` | Cross-reference | `\x + \xo 1:1 \xt John 1:1\x*` |
| `\s` | Section heading | `\s The Creation Account` |

## Utility APIs

### Bible Utilities

#### formatVerseReference()
```typescript
formatVerseReference(ref: VerseReference): string

interface VerseReference {
  bookId: string;
  chapter: number;
  verse: number;
  endVerse?: number;
}
```
Format a verse reference as readable text.

**Example:**
```typescript
formatVerseReference({ bookId: 'gen', chapter: 1, verse: 1 })
// Returns: "Genesis 1:1"
```

#### parseVerseReference()
```typescript
parseVerseReference(refString: string): VerseReference | null
```
Parse a verse reference string into structured data.

#### generateVerseId()
```typescript
generateVerseId(bookId: string, chapter: number, verse: number): string
```
Generate a unique verse identifier.

### General Utilities

#### debounce()
```typescript
debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

#### throttle()
```typescript
throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void
```

#### storage
```typescript
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```
Cross-platform storage abstraction.

## Search APIs

### Search Types

#### SearchResult
```typescript
interface SearchResult {
  verse: BibleVerse;             // Matching verse
  book: BibleBook;               // Containing book
  chapter: BibleChapter;         // Containing chapter
  relevanceScore: number;        // Search relevance (0-100)
  highlightedText: string;       // Text with search terms highlighted
}
```

#### Advanced Search Options
```typescript
interface AdvancedSearchOptions {
  books?: string[];              // Limit to specific books
  testament?: 'old' | 'new';     // Testament filter
  dateRange?: {                  // Historical date range
    start: string;
    end: string;
  };
  author?: string;               // Traditional author
  genre?: string;                // Book genre
}
```

## Quote Creator APIs

### Quote Types

#### QuoteTemplate
```typescript
interface QuoteTemplate {
  id: string;
  name: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textStyle: TextStyle;
  layout: QuoteLayout;
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  dropShadow?: DropShadow;
  outline?: TextOutline;
}

interface QuoteLayout {
  format: 'mobile' | 'desktop' | 'square';
  width: number;
  height: number;
  padding: number;
  versePosition: 'top' | 'center' | 'bottom';
  referencePosition: 'below' | 'corner';
}
```

### Quote Generation

#### generateQuote()
```typescript
async generateQuote(
  verseText: string,
  reference: string,
  template: QuoteTemplate
): Promise<GeneratedQuote>
```

## Error Handling

### Error Types

```typescript
class BibleAppError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

// Specific error types
class DatabaseError extends BibleAppError {}
class ParserError extends BibleAppError {}
class NetworkError extends BibleAppError {}
class ValidationError extends BibleAppError {}
```

### Error Codes

| Code | Description |
|------|-------------|
| `DB_INIT_FAILED` | Database initialization failed |
| `DB_QUERY_FAILED` | Database query failed |
| `PARSE_INVALID_USFM` | Invalid USFM format |
| `PARSE_MISSING_MARKERS` | Required USFM markers missing |
| `NETWORK_TIMEOUT` | Network request timeout |
| `VALIDATION_INVALID_INPUT` | Invalid input data |

## Platform-Specific APIs

### Electron APIs (Desktop)

#### electronAPI
```typescript
interface ElectronAPI {
  getAppVersion(): Promise<string>;
  getUserDataPath(): Promise<string>;
  showSaveDialog(options: any): Promise<any>;
  showOpenDialog(options: any): Promise<any>;
  databaseQuery(query: string, params?: any[]): Promise<any>;
  onMenuAction(callback: (action: string, ...args: any[]) => void): void;
  platform: string;
  isDevelopment: boolean;
}
```

### React Native APIs (Mobile)

#### AsyncStorage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Usage in storage utility
const storage = {
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
};
```

## Testing APIs

### Test Utilities

#### createMockBibleVersion()
```typescript
function createMockBibleVersion(overrides?: Partial<BibleVersion>): BibleVersion
```

#### createMockVerse()
```typescript
function createMockVerse(overrides?: Partial<BibleVerse>): BibleVerse
```

#### setupTestDatabase()
```typescript
async function setupTestDatabase(): Promise<BibleDatabase>
```

### Test Helpers

```typescript
// Mock store for testing
export const createMockStore = (initialState?: Partial<BibleState>) => {
  return create<BibleState>()(() => ({
    versions: [],
    currentVersion: null,
    // ... default state
    ...initialState
  }));
};
```

## Migration APIs

### Database Migrations

#### Migration Interface
```typescript
interface Migration {
  version: number;
  description: string;
  up: (db: Database) => Promise<void>;
  down: (db: Database) => Promise<void>;
}
```

#### Migration Runner
```typescript
class MigrationRunner {
  async runMigrations(db: Database, targetVersion?: number): Promise<void>;
  async rollback(db: Database, targetVersion: number): Promise<void>;
  getCurrentVersion(db: Database): Promise<number>;
}
```

This API documentation provides a comprehensive reference for developers working with the Bible App codebase. For implementation examples and usage patterns, refer to the source code and test files.
