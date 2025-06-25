import { BibleVersion, BibleBook } from '@bible/shared';

/**
 * Validate a parsed Bible version
 */
export function validateBibleVersion(version: BibleVersion): string[] {
  const errors: string[] = [];
  
  if (!version.id) {
    errors.push('Bible version must have an ID');
  }
  
  if (!version.name) {
    errors.push('Bible version must have a name');
  }
  
  if (!version.books || version.books.length === 0) {
    errors.push('Bible version must contain at least one book');
  }
  
  // Validate each book
  version.books.forEach((book, bookIndex) => {
    const bookErrors = validateBibleBook(book);
    bookErrors.forEach(error => {
      errors.push(`Book ${bookIndex + 1} (${book.name || 'unnamed'}): ${error}`);
    });
  });
  
  return errors;
}

/**
 * Validate a Bible book
 */
export function validateBibleBook(book: BibleBook): string[] {
  const errors: string[] = [];
  
  if (!book.id) {
    errors.push('Book must have an ID');
  }
  
  if (!book.name) {
    errors.push('Book must have a name');
  }
  
  if (!book.chapters || book.chapters.length === 0) {
    errors.push('Book must contain at least one chapter');
  }
  
  // Validate chapter numbering
  book.chapters.forEach((chapter, index) => {
    if (chapter.number !== index + 1) {
      errors.push(`Chapter ${index + 1} has incorrect number: ${chapter.number}`);
    }
    
    if (!chapter.verses || chapter.verses.length === 0) {
      errors.push(`Chapter ${chapter.number} must contain at least one verse`);
    }
    
    // Validate verse numbering
    chapter.verses.forEach((verse, verseIndex) => {
      if (verse.number !== verseIndex + 1) {
        errors.push(`Chapter ${chapter.number}, verse ${verseIndex + 1} has incorrect number: ${verse.number}`);
      }
      
      if (!verse.text || verse.text.trim().length === 0) {
        errors.push(`Chapter ${chapter.number}, verse ${verse.number} has empty text`);
      }
    });
  });
  
  return errors;
}

/**
 * Get statistics about a Bible version
 */
export function getBibleStatistics(version: BibleVersion) {
  let totalChapters = 0;
  let totalVerses = 0;
  let totalWords = 0;
  let totalCharacters = 0;
  
  const bookStats = version.books.map(book => {
    let bookChapters = book.chapters.length;
    let bookVerses = 0;
    let bookWords = 0;
    let bookCharacters = 0;
    
    book.chapters.forEach(chapter => {
      bookVerses += chapter.verses.length;
      
      chapter.verses.forEach(verse => {
        const words = verse.text.split(/\s+/).filter(word => word.length > 0);
        bookWords += words.length;
        bookCharacters += verse.text.length;
      });
    });
    
    totalChapters += bookChapters;
    totalVerses += bookVerses;
    totalWords += bookWords;
    totalCharacters += bookCharacters;
    
    return {
      book: book.name,
      chapters: bookChapters,
      verses: bookVerses,
      words: bookWords,
      characters: bookCharacters
    };
  });
  
  return {
    version: version.name,
    books: version.books.length,
    chapters: totalChapters,
    verses: totalVerses,
    words: totalWords,
    characters: totalCharacters,
    bookStats
  };
}

/**
 * Convert Bible version to JSON with optional formatting
 */
export function bibleToJSON(version: BibleVersion, pretty = false): string {
  return JSON.stringify(version, null, pretty ? 2 : 0);
}

/**
 * Load Bible version from JSON string
 */
export function bibleFromJSON(jsonString: string): BibleVersion {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Convert date strings back to Date objects if needed
    if (parsed.books) {
      parsed.books.forEach((book: any) => {
        if (book.chapters) {
          book.chapters.forEach((chapter: any) => {
            if (chapter.verses) {
              chapter.verses.forEach((verse: any) => {
                if (verse.footnotes) {
                  verse.footnotes.forEach((footnote: any) => {
                    if (footnote.createdAt && typeof footnote.createdAt === 'string') {
                      footnote.createdAt = new Date(footnote.createdAt);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return parsed as BibleVersion;
  } catch (error) {
    throw new Error(`Failed to parse Bible JSON: ${error}`);
  }
}

/**
 * Extract all unique words from a Bible version for search indexing
 */
export function extractWords(version: BibleVersion): Set<string> {
  const words = new Set<string>();
  
  version.books.forEach(book => {
    book.chapters.forEach(chapter => {
      chapter.verses.forEach(verse => {
        // Extract words, removing punctuation and converting to lowercase
        const verseWords = verse.text
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 0);
        
        verseWords.forEach(word => words.add(word));
      });
    });
  });
  
  return words;
}

/**
 * Create a simple search index for a Bible version
 */
export function createSearchIndex(version: BibleVersion): Map<string, Array<{bookId: string, chapter: number, verse: number}>> {
  const index = new Map<string, Array<{bookId: string, chapter: number, verse: number}>>();
  
  version.books.forEach(book => {
    book.chapters.forEach(chapter => {
      chapter.verses.forEach(verse => {
        const words = verse.text
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 0);
        
        words.forEach(word => {
          if (!index.has(word)) {
            index.set(word, []);
          }
          
          index.get(word)!.push({
            bookId: book.id,
            chapter: chapter.number,
            verse: verse.number
          });
        });
      });
    });
  });
  
  return index;
}
