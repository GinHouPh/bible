import { BibleBook, VerseReference, BibleVerse } from '../types';

// Bible book order and metadata
export const BIBLE_BOOKS_ORDER = [
  // Old Testament
  'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa',
  '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro',
  'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk', 'dan', 'hos', 'jol', 'amo',
  'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal',
  // New Testament
  'mat', 'mrk', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph',
  'php', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas',
  '1pe', '2pe', '1jn', '2jn', '3jn', 'jud', 'rev'
];

export const BOOK_NAMES: Record<string, { name: string; abbreviation: string; testament: 'old' | 'new' }> = {
  // Old Testament
  gen: { name: 'Genesis', abbreviation: 'Gen', testament: 'old' },
  exo: { name: 'Exodus', abbreviation: 'Exo', testament: 'old' },
  lev: { name: 'Leviticus', abbreviation: 'Lev', testament: 'old' },
  num: { name: 'Numbers', abbreviation: 'Num', testament: 'old' },
  deu: { name: 'Deuteronomy', abbreviation: 'Deu', testament: 'old' },
  jos: { name: 'Joshua', abbreviation: 'Jos', testament: 'old' },
  jdg: { name: 'Judges', abbreviation: 'Jdg', testament: 'old' },
  rut: { name: 'Ruth', abbreviation: 'Rut', testament: 'old' },
  '1sa': { name: '1 Samuel', abbreviation: '1Sa', testament: 'old' },
  '2sa': { name: '2 Samuel', abbreviation: '2Sa', testament: 'old' },
  '1ki': { name: '1 Kings', abbreviation: '1Ki', testament: 'old' },
  '2ki': { name: '2 Kings', abbreviation: '2Ki', testament: 'old' },
  '1ch': { name: '1 Chronicles', abbreviation: '1Ch', testament: 'old' },
  '2ch': { name: '2 Chronicles', abbreviation: '2Ch', testament: 'old' },
  ezr: { name: 'Ezra', abbreviation: 'Ezr', testament: 'old' },
  neh: { name: 'Nehemiah', abbreviation: 'Neh', testament: 'old' },
  est: { name: 'Esther', abbreviation: 'Est', testament: 'old' },
  job: { name: 'Job', abbreviation: 'Job', testament: 'old' },
  psa: { name: 'Psalms', abbreviation: 'Psa', testament: 'old' },
  pro: { name: 'Proverbs', abbreviation: 'Pro', testament: 'old' },
  ecc: { name: 'Ecclesiastes', abbreviation: 'Ecc', testament: 'old' },
  sng: { name: 'Song of Songs', abbreviation: 'Sng', testament: 'old' },
  isa: { name: 'Isaiah', abbreviation: 'Isa', testament: 'old' },
  jer: { name: 'Jeremiah', abbreviation: 'Jer', testament: 'old' },
  lam: { name: 'Lamentations', abbreviation: 'Lam', testament: 'old' },
  ezk: { name: 'Ezekiel', abbreviation: 'Ezk', testament: 'old' },
  dan: { name: 'Daniel', abbreviation: 'Dan', testament: 'old' },
  hos: { name: 'Hosea', abbreviation: 'Hos', testament: 'old' },
  jol: { name: 'Joel', abbreviation: 'Jol', testament: 'old' },
  amo: { name: 'Amos', abbreviation: 'Amo', testament: 'old' },
  oba: { name: 'Obadiah', abbreviation: 'Oba', testament: 'old' },
  jon: { name: 'Jonah', abbreviation: 'Jon', testament: 'old' },
  mic: { name: 'Micah', abbreviation: 'Mic', testament: 'old' },
  nam: { name: 'Nahum', abbreviation: 'Nam', testament: 'old' },
  hab: { name: 'Habakkuk', abbreviation: 'Hab', testament: 'old' },
  zep: { name: 'Zephaniah', abbreviation: 'Zep', testament: 'old' },
  hag: { name: 'Haggai', abbreviation: 'Hag', testament: 'old' },
  zec: { name: 'Zechariah', abbreviation: 'Zec', testament: 'old' },
  mal: { name: 'Malachi', abbreviation: 'Mal', testament: 'old' },
  // New Testament
  mat: { name: 'Matthew', abbreviation: 'Mat', testament: 'new' },
  mrk: { name: 'Mark', abbreviation: 'Mrk', testament: 'new' },
  luk: { name: 'Luke', abbreviation: 'Luk', testament: 'new' },
  jhn: { name: 'John', abbreviation: 'Jhn', testament: 'new' },
  act: { name: 'Acts', abbreviation: 'Act', testament: 'new' },
  rom: { name: 'Romans', abbreviation: 'Rom', testament: 'new' },
  '1co': { name: '1 Corinthians', abbreviation: '1Co', testament: 'new' },
  '2co': { name: '2 Corinthians', abbreviation: '2Co', testament: 'new' },
  gal: { name: 'Galatians', abbreviation: 'Gal', testament: 'new' },
  eph: { name: 'Ephesians', abbreviation: 'Eph', testament: 'new' },
  php: { name: 'Philippians', abbreviation: 'Php', testament: 'new' },
  col: { name: 'Colossians', abbreviation: 'Col', testament: 'new' },
  '1th': { name: '1 Thessalonians', abbreviation: '1Th', testament: 'new' },
  '2th': { name: '2 Thessalonians', abbreviation: '2Th', testament: 'new' },
  '1ti': { name: '1 Timothy', abbreviation: '1Ti', testament: 'new' },
  '2ti': { name: '2 Timothy', abbreviation: '2Ti', testament: 'new' },
  tit: { name: 'Titus', abbreviation: 'Tit', testament: 'new' },
  phm: { name: 'Philemon', abbreviation: 'Phm', testament: 'new' },
  heb: { name: 'Hebrews', abbreviation: 'Heb', testament: 'new' },
  jas: { name: 'James', abbreviation: 'Jas', testament: 'new' },
  '1pe': { name: '1 Peter', abbreviation: '1Pe', testament: 'new' },
  '2pe': { name: '2 Peter', abbreviation: '2Pe', testament: 'new' },
  '1jn': { name: '1 John', abbreviation: '1Jn', testament: 'new' },
  '2jn': { name: '2 John', abbreviation: '2Jn', testament: 'new' },
  '3jn': { name: '3 John', abbreviation: '3Jn', testament: 'new' },
  jud: { name: 'Jude', abbreviation: 'Jud', testament: 'new' },
  rev: { name: 'Revelation', abbreviation: 'Rev', testament: 'new' }
};

/**
 * Format a verse reference as a readable string
 */
export function formatVerseReference(ref: VerseReference): string {
  const bookInfo = BOOK_NAMES[ref.bookId];
  if (!bookInfo) return '';
  
  const bookName = bookInfo.name;
  const chapter = ref.chapter;
  const verse = ref.verse;
  const endVerse = ref.endVerse;
  
  if (endVerse && endVerse !== verse) {
    return `${bookName} ${chapter}:${verse}-${endVerse}`;
  }
  
  return `${bookName} ${chapter}:${verse}`;
}

/**
 * Parse a verse reference string into VerseReference object
 */
export function parseVerseReference(refString: string): VerseReference | null {
  // Match patterns like "Genesis 1:1", "Gen 1:1-3", "1 John 2:5"
  const regex = /^(\d?\s?\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i;
  const match = refString.trim().match(regex);
  
  if (!match) return null;
  
  const [, bookName, chapterStr, verseStr, endVerseStr] = match;
  
  // Find book ID by name or abbreviation
  const bookId = Object.keys(BOOK_NAMES).find(id => {
    const book = BOOK_NAMES[id];
    return book.name.toLowerCase() === bookName.toLowerCase() ||
           book.abbreviation.toLowerCase() === bookName.toLowerCase();
  });
  
  if (!bookId) return null;
  
  return {
    bookId,
    chapter: parseInt(chapterStr, 10),
    verse: parseInt(verseStr, 10),
    endVerse: endVerseStr ? parseInt(endVerseStr, 10) : undefined
  };
}

/**
 * Get the next book in reading order
 */
export function getNextBook(currentBookId: string): string | null {
  const currentIndex = BIBLE_BOOKS_ORDER.indexOf(currentBookId);
  if (currentIndex === -1 || currentIndex === BIBLE_BOOKS_ORDER.length - 1) {
    return null;
  }
  return BIBLE_BOOKS_ORDER[currentIndex + 1];
}

/**
 * Get the previous book in reading order
 */
export function getPreviousBook(currentBookId: string): string | null {
  const currentIndex = BIBLE_BOOKS_ORDER.indexOf(currentBookId);
  if (currentIndex <= 0) {
    return null;
  }
  return BIBLE_BOOKS_ORDER[currentIndex - 1];
}

/**
 * Check if a book is in the Old Testament
 */
export function isOldTestament(bookId: string): boolean {
  return BOOK_NAMES[bookId]?.testament === 'old';
}

/**
 * Check if a book is in the New Testament
 */
export function isNewTestament(bookId: string): boolean {
  return BOOK_NAMES[bookId]?.testament === 'new';
}

/**
 * Generate a unique verse ID
 */
export function generateVerseId(bookId: string, chapter: number, verse: number): string {
  return `${bookId}-${chapter}-${verse}`;
}

/**
 * Extract verse information from verse ID
 */
export function parseVerseId(verseId: string): { bookId: string; chapter: number; verse: number } | null {
  const parts = verseId.split('-');
  if (parts.length !== 3) return null;
  
  const [bookId, chapterStr, verseStr] = parts;
  const chapter = parseInt(chapterStr, 10);
  const verse = parseInt(verseStr, 10);
  
  if (isNaN(chapter) || isNaN(verse)) return null;
  
  return { bookId, chapter, verse };
}
