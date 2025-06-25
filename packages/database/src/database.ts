import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import {
  BibleVersion,
  BibleBook,
  BibleChapter,
  BibleVerse,
  UserHighlight,
  UserNote,
  UserFavorite,
  ReadingHistory,
  ReadingPlan,
  AppSettings,
  SearchResult,
  SearchQuery
} from '@bible/shared';

export interface DatabaseConfig {
  wasmUrl?: string;
  databasePath?: string;
  enableFTS?: boolean;
}

export class BibleDatabase {
  private db: SqlJsDatabase | null = null;
  private isInitialized = false;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig = {}) {
    this.config = {
      enableFTS: true,
      ...config
    };
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file) => this.config.wasmUrl || `https://sql.js.org/dist/${file}`
      });

      // Create or open database
      if (this.config.databasePath) {
        // Load existing database file (for Node.js/Electron)
        const fs = require('fs');
        if (fs.existsSync(this.config.databasePath)) {
          const filebuffer = fs.readFileSync(this.config.databasePath);
          this.db = new SQL.Database(filebuffer);
        } else {
          this.db = new SQL.Database();
        }
      } else {
        // Create in-memory database (for web)
        this.db = new SQL.Database();
      }

      // Initialize schema
      await this.initializeSchema();
      
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  /**
   * Initialize database schema
   */
  private async initializeSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Read schema from file or define inline
    const schema = await this.getSchema();
    
    // Execute schema statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      try {
        this.db.run(statement);
      } catch (error) {
        console.warn('Schema statement failed:', statement, error);
      }
    }
  }

  /**
   * Get database schema
   */
  private async getSchema(): Promise<string> {
    // In a real implementation, you would load this from the schema.sql file
    // For now, we'll return a simplified version
    return `
      CREATE TABLE IF NOT EXISTS bible_versions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        language TEXT NOT NULL,
        language_code TEXT NOT NULL,
        description TEXT,
        copyright TEXT,
        publisher TEXT,
        year INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bible_books (
        id TEXT PRIMARY KEY,
        version_id TEXT NOT NULL,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        testament TEXT NOT NULL,
        book_order INTEGER NOT NULL,
        FOREIGN KEY (version_id) REFERENCES bible_versions(id)
      );

      CREATE TABLE IF NOT EXISTS bible_chapters (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        number INTEGER NOT NULL,
        title TEXT,
        FOREIGN KEY (book_id) REFERENCES bible_books(id),
        UNIQUE(book_id, number)
      );

      CREATE TABLE IF NOT EXISTS bible_verses (
        id TEXT PRIMARY KEY,
        chapter_id TEXT NOT NULL,
        number INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (chapter_id) REFERENCES bible_chapters(id),
        UNIQUE(chapter_id, number)
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY,
        theme TEXT DEFAULT 'auto',
        font_size INTEGER DEFAULT 16,
        font_family TEXT DEFAULT 'serif',
        line_height REAL DEFAULT 1.6,
        default_bible_version TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_highlights (
        id TEXT PRIMARY KEY,
        verse_id TEXT NOT NULL,
        color TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_notes (
        id TEXT PRIMARY KEY,
        verse_id TEXT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_favorites (
        id TEXT PRIMARY KEY,
        verse_id TEXT NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reading_history (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER,
        duration INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }

  /**
   * Save Bible version to database
   */
  async saveBibleVersion(version: BibleVersion): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      this.db.run('BEGIN TRANSACTION');

      // Insert version
      this.db.run(`
        INSERT OR REPLACE INTO bible_versions 
        (id, name, abbreviation, language, language_code, description, copyright, publisher, year)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        version.id,
        version.name,
        version.abbreviation,
        version.language,
        version.languageCode,
        version.description || null,
        version.copyright || null,
        version.publisher || null,
        version.year || null
      ]);

      // Insert books
      for (let bookIndex = 0; bookIndex < version.books.length; bookIndex++) {
        const book = version.books[bookIndex];
        
        this.db.run(`
          INSERT OR REPLACE INTO bible_books 
          (id, version_id, name, abbreviation, testament, book_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          `${version.id}-${book.id}`,
          version.id,
          book.name,
          book.abbreviation,
          book.testament,
          bookIndex + 1
        ]);

        // Insert chapters
        for (const chapter of book.chapters) {
          const chapterId = `${version.id}-${book.id}-${chapter.number}`;
          
          this.db.run(`
            INSERT OR REPLACE INTO bible_chapters 
            (id, book_id, number, title)
            VALUES (?, ?, ?, ?)
          `, [
            chapterId,
            `${version.id}-${book.id}`,
            chapter.number,
            chapter.title || null
          ]);

          // Insert verses
          for (const verse of chapter.verses) {
            const verseId = `${version.id}-${book.id}-${chapter.number}-${verse.number}`;
            
            this.db.run(`
              INSERT OR REPLACE INTO bible_verses 
              (id, chapter_id, number, text)
              VALUES (?, ?, ?, ?)
            `, [
              verseId,
              chapterId,
              verse.number,
              verse.text
            ]);
          }
        }
      }

      this.db.run('COMMIT');
    } catch (error) {
      this.db.run('ROLLBACK');
      throw new Error(`Failed to save Bible version: ${error}`);
    }
  }

  /**
   * Get Bible version by ID
   */
  async getBibleVersion(versionId: string): Promise<BibleVersion | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Get version info
      const versionResult = this.db.exec(`
        SELECT * FROM bible_versions WHERE id = ?
      `, [versionId]);

      if (versionResult.length === 0 || versionResult[0].values.length === 0) {
        return null;
      }

      const versionRow = versionResult[0].values[0];
      const version: BibleVersion = {
        id: versionRow[0] as string,
        name: versionRow[1] as string,
        abbreviation: versionRow[2] as string,
        language: versionRow[3] as string,
        languageCode: versionRow[4] as string,
        description: versionRow[5] as string || undefined,
        copyright: versionRow[6] as string || undefined,
        publisher: versionRow[7] as string || undefined,
        year: versionRow[8] as number || undefined,
        books: []
      };

      // Get books
      const booksResult = this.db.exec(`
        SELECT * FROM bible_books 
        WHERE version_id = ? 
        ORDER BY book_order
      `, [versionId]);

      if (booksResult.length > 0) {
        for (const bookRow of booksResult[0].values) {
          const bookId = (bookRow[0] as string).replace(`${versionId}-`, '');
          const book: BibleBook = {
            id: bookId,
            name: bookRow[2] as string,
            abbreviation: bookRow[3] as string,
            testament: bookRow[4] as 'old' | 'new',
            chapters: []
          };

          // Get chapters for this book
          const chaptersResult = this.db.exec(`
            SELECT * FROM bible_chapters 
            WHERE book_id = ? 
            ORDER BY number
          `, [bookRow[0]]);

          if (chaptersResult.length > 0) {
            for (const chapterRow of chaptersResult[0].values) {
              const chapter: BibleChapter = {
                number: chapterRow[2] as number,
                title: chapterRow[3] as string || undefined,
                verses: []
              };

              // Get verses for this chapter
              const versesResult = this.db.exec(`
                SELECT * FROM bible_verses 
                WHERE chapter_id = ? 
                ORDER BY number
              `, [chapterRow[0]]);

              if (versesResult.length > 0) {
                for (const verseRow of versesResult[0].values) {
                  const verse: BibleVerse = {
                    number: verseRow[2] as number,
                    text: verseRow[3] as string
                  };
                  chapter.verses.push(verse);
                }
              }

              book.chapters.push(chapter);
            }
          }

          version.books.push(book);
        }
      }

      return version;
    } catch (error) {
      throw new Error(`Failed to get Bible version: ${error}`);
    }
  }

  /**
   * Get all Bible versions
   */
  async getAllBibleVersions(): Promise<BibleVersion[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = this.db.exec('SELECT id FROM bible_versions ORDER BY name');
      
      if (result.length === 0) return [];

      const versions: BibleVersion[] = [];
      
      for (const row of result[0].values) {
        const version = await this.getBibleVersion(row[0] as string);
        if (version) {
          versions.push(version);
        }
      }

      return versions;
    } catch (error) {
      throw new Error(`Failed to get Bible versions: ${error}`);
    }
  }

  /**
   * Search verses
   */
  async searchVerses(query: SearchQuery): Promise<SearchResult[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      let sql = `
        SELECT v.id, v.text, v.number as verse_number,
               c.number as chapter_number,
               b.id as book_id, b.name as book_name, b.testament,
               ver.id as version_id
        FROM bible_verses v
        JOIN bible_chapters c ON v.chapter_id = c.id
        JOIN bible_books b ON c.book_id = b.id
        JOIN bible_versions ver ON b.version_id = ver.id
        WHERE v.text LIKE ?
      `;

      const params: any[] = [`%${query.text}%`];

      // Add filters
      if (query.books && query.books.length > 0) {
        const bookPlaceholders = query.books.map(() => '?').join(',');
        sql += ` AND b.id IN (${bookPlaceholders})`;
        params.push(...query.books);
      }

      if (query.testament) {
        sql += ` AND b.testament = ?`;
        params.push(query.testament);
      }

      sql += ` ORDER BY b.book_order, c.number, v.number LIMIT 100`;

      const result = this.db.exec(sql, params);

      if (result.length === 0) return [];

      const searchResults: SearchResult[] = [];

      for (const row of result[0].values) {
        // Create mock objects for the search result
        const verse: BibleVerse = {
          number: row[2] as number,
          text: row[1] as string
        };

        const chapter: BibleChapter = {
          number: row[3] as number,
          verses: [verse]
        };

        const book: BibleBook = {
          id: row[4] as string,
          name: row[5] as string,
          abbreviation: row[5] as string,
          testament: row[6] as 'old' | 'new',
          chapters: [chapter]
        };

        // Simple relevance scoring
        const text = verse.text.toLowerCase();
        const searchTerm = query.text.toLowerCase();
        const relevanceScore = (text.match(new RegExp(searchTerm, 'g')) || []).length;

        // Highlight matched text
        const highlightedText = verse.text.replace(
          new RegExp(query.text, query.caseSensitive ? 'g' : 'gi'),
          '<mark>$&</mark>'
        );

        searchResults.push({
          verse,
          book,
          chapter,
          relevanceScore,
          highlightedText
        });
      }

      return searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      throw new Error(`Failed to search verses: ${error}`);
    }
  }

  /**
   * Save user settings
   */
  async saveUserSettings(settings: AppSettings): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      this.db.run(`
        INSERT OR REPLACE INTO user_settings 
        (id, theme, font_size, font_family, line_height, default_bible_version, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        settings.theme,
        settings.fontSize,
        settings.fontFamily,
        settings.lineHeight,
        settings.defaultBibleVersion || null
      ]);
    } catch (error) {
      throw new Error(`Failed to save user settings: ${error}`);
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<AppSettings | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = this.db.exec('SELECT * FROM user_settings WHERE id = 1');
      
      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }

      const row = result[0].values[0];
      
      return {
        theme: row[1] as 'light' | 'dark' | 'auto',
        fontSize: row[2] as number,
        fontFamily: row[3] as 'serif' | 'sans-serif' | 'monospace',
        lineHeight: row[4] as number,
        defaultBibleVersion: row[5] as string || 'ESV',
        enableParallelReading: false,
        enableVoiceNarration: false,
        dailyReminder: false,
        language: 'en',
        autoSync: true
      };
    } catch (error) {
      throw new Error(`Failed to get user settings: ${error}`);
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      // Save database to file if path is specified
      if (this.config.databasePath) {
        const fs = require('fs');
        const data = this.db.export();
        fs.writeFileSync(this.config.databasePath, data);
      }
      
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Export database as Uint8Array
   */
  export(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  /**
   * Get database instance (for advanced operations)
   */
  getDatabase(): SqlJsDatabase | null {
    return this.db;
  }
}
