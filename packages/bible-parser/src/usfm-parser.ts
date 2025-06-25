import {
  BibleVersion,
  BibleBook,
  BibleChapter,
  BibleVerse,
  Footnote,
  CrossReference,
  VerseReference
} from '@bible/shared';

// USFM marker types
interface USFMMarker {
  marker: string;
  content: string;
  attributes?: Record<string, string>;
}

// Parser state
interface ParserState {
  currentBook?: BibleBook;
  currentChapter?: BibleChapter;
  currentVerse?: BibleVerse;
  verses: BibleVerse[];
  chapters: BibleChapter[];
  books: BibleBook[];
  footnotes: Footnote[];
  crossReferences: CrossReference[];
}

export class USFMParser {
  private state: ParserState = {
    verses: [],
    chapters: [],
    books: [],
    footnotes: [],
    crossReferences: []
  };

  /**
   * Parse USFM text into a BibleVersion object
   */
  public parseUSFM(usfmText: string, versionInfo: Partial<BibleVersion>): BibleVersion {
    this.resetState();
    
    const lines = usfmText.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || !trimmedLine.startsWith('\\')) continue;
      
      const marker = this.parseMarker(trimmedLine);
      this.processMarker(marker);
    }
    
    // Finalize any remaining content
    this.finalizeCurrentVerse();
    this.finalizeCurrentChapter();
    this.finalizeCurrentBook();
    
    return {
      id: versionInfo.id || 'unknown',
      name: versionInfo.name || 'Unknown Version',
      abbreviation: versionInfo.abbreviation || 'UNK',
      language: versionInfo.language || 'en',
      languageCode: versionInfo.languageCode || 'en',
      description: versionInfo.description,
      copyright: versionInfo.copyright,
      publisher: versionInfo.publisher,
      year: versionInfo.year,
      books: this.state.books
    };
  }

  /**
   * Parse a single USFM marker line
   */
  private parseMarker(line: string): USFMMarker {
    // Match pattern: \marker content or \marker|attribute=value content
    const markerMatch = line.match(/^\\([a-zA-Z0-9]+)(\|[^\\]*)?(.*)$/);
    
    if (!markerMatch) {
      return { marker: 'text', content: line };
    }
    
    const [, marker, attributesPart, content] = markerMatch;
    const attributes: Record<string, string> = {};
    
    // Parse attributes if present
    if (attributesPart) {
      const attrString = attributesPart.substring(1); // Remove leading |
      const attrPairs = attrString.split('|');
      
      for (const pair of attrPairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          attributes[key.trim()] = value.trim();
        }
      }
    }
    
    return {
      marker: marker.toLowerCase(),
      content: content.trim(),
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined
    };
  }

  /**
   * Process a parsed USFM marker
   */
  private processMarker(marker: USFMMarker): void {
    switch (marker.marker) {
      case 'id':
        this.handleBookIdentification(marker);
        break;
      case 'h':
        this.handleBookHeader(marker);
        break;
      case 'toc1':
      case 'toc2':
      case 'toc3':
        this.handleTableOfContents(marker);
        break;
      case 'mt':
      case 'mt1':
      case 'mt2':
        this.handleMainTitle(marker);
        break;
      case 'c':
        this.handleChapter(marker);
        break;
      case 'v':
        this.handleVerse(marker);
        break;
      case 'p':
      case 'q':
      case 'q1':
      case 'q2':
      case 'm':
        this.handleParagraph(marker);
        break;
      case 'f':
        this.handleFootnote(marker);
        break;
      case 'x':
        this.handleCrossReference(marker);
        break;
      case 's':
      case 's1':
      case 's2':
        this.handleSectionHeader(marker);
        break;
      default:
        // Handle unknown markers as text content
        this.appendToCurrentVerse(marker.content);
        break;
    }
  }

  /**
   * Handle book identification marker (\id)
   */
  private handleBookIdentification(marker: USFMMarker): void {
    this.finalizeCurrentVerse();
    this.finalizeCurrentChapter();
    this.finalizeCurrentBook();
    
    const parts = marker.content.split(' ');
    const bookId = parts[0].toLowerCase();
    
    this.state.currentBook = {
      id: bookId,
      name: this.getBookName(bookId),
      abbreviation: this.getBookAbbreviation(bookId),
      testament: this.getTestament(bookId),
      chapters: [],
      description: parts.slice(1).join(' ') || undefined
    };
  }

  /**
   * Handle book header marker (\h)
   */
  private handleBookHeader(marker: USFMMarker): void {
    if (this.state.currentBook) {
      this.state.currentBook.name = marker.content;
    }
  }

  /**
   * Handle table of contents markers (\toc1, \toc2, \toc3)
   */
  private handleTableOfContents(marker: USFMMarker): void {
    if (this.state.currentBook) {
      switch (marker.marker) {
        case 'toc1':
          this.state.currentBook.name = marker.content;
          break;
        case 'toc2':
          this.state.currentBook.name = marker.content;
          break;
        case 'toc3':
          this.state.currentBook.abbreviation = marker.content;
          break;
      }
    }
  }

  /**
   * Handle main title markers (\mt, \mt1, \mt2)
   */
  private handleMainTitle(marker: USFMMarker): void {
    if (this.state.currentBook) {
      this.state.currentBook.name = marker.content;
    }
  }

  /**
   * Handle chapter marker (\c)
   */
  private handleChapter(marker: USFMMarker): void {
    this.finalizeCurrentVerse();
    this.finalizeCurrentChapter();
    
    const chapterNumber = parseInt(marker.content, 10);
    
    this.state.currentChapter = {
      number: chapterNumber,
      verses: []
    };
  }

  /**
   * Handle verse marker (\v)
   */
  private handleVerse(marker: USFMMarker): void {
    this.finalizeCurrentVerse();
    
    // Parse verse number (could be range like "1-2" or single number)
    const verseMatch = marker.content.match(/^(\d+)(?:-(\d+))?\s*(.*)/);
    
    if (verseMatch) {
      const [, startVerse, endVerse, text] = verseMatch;
      const verseNumber = parseInt(startVerse, 10);
      
      this.state.currentVerse = {
        number: verseNumber,
        text: text.trim(),
        usfmMarkers: [`\\v ${marker.content}`]
      };
    }
  }

  /**
   * Handle paragraph markers (\p, \q, \m, etc.)
   */
  private handleParagraph(marker: USFMMarker): void {
    // Add paragraph formatting to current verse
    if (marker.content) {
      this.appendToCurrentVerse(marker.content);
    }
  }

  /**
   * Handle footnote marker (\f)
   */
  private handleFootnote(marker: USFMMarker): void {
    if (this.state.currentVerse) {
      const footnote: Footnote = {
        id: `fn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        verseId: this.generateVerseId(),
        marker: marker.attributes?.caller || '*',
        text: marker.content,
        type: 'explanation'
      };
      
      this.state.footnotes.push(footnote);
      
      if (!this.state.currentVerse.footnotes) {
        this.state.currentVerse.footnotes = [];
      }
      this.state.currentVerse.footnotes.push(footnote);
    }
  }

  /**
   * Handle cross-reference marker (\x)
   */
  private handleCrossReference(marker: USFMMarker): void {
    if (this.state.currentVerse) {
      // Parse cross-reference content for verse references
      const references = this.parseCrossReferences(marker.content);
      
      const crossRef: CrossReference = {
        id: `xr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        verseId: this.generateVerseId(),
        references,
        description: marker.content
      };
      
      this.state.crossReferences.push(crossRef);
      
      if (!this.state.currentVerse.crossReferences) {
        this.state.currentVerse.crossReferences = [];
      }
      this.state.currentVerse.crossReferences.push(crossRef);
    }
  }

  /**
   * Handle section header markers (\s, \s1, \s2)
   */
  private handleSectionHeader(marker: USFMMarker): void {
    if (this.state.currentChapter) {
      this.state.currentChapter.title = marker.content;
    }
  }

  /**
   * Append text to the current verse
   */
  private appendToCurrentVerse(text: string): void {
    if (this.state.currentVerse && text) {
      if (this.state.currentVerse.text) {
        this.state.currentVerse.text += ' ' + text;
      } else {
        this.state.currentVerse.text = text;
      }
    }
  }

  /**
   * Finalize the current verse and add it to the chapter
   */
  private finalizeCurrentVerse(): void {
    if (this.state.currentVerse && this.state.currentChapter) {
      this.state.currentChapter.verses.push(this.state.currentVerse);
      this.state.currentVerse = undefined;
    }
  }

  /**
   * Finalize the current chapter and add it to the book
   */
  private finalizeCurrentChapter(): void {
    if (this.state.currentChapter && this.state.currentBook) {
      this.state.currentBook.chapters.push(this.state.currentChapter);
      this.state.currentChapter = undefined;
    }
  }

  /**
   * Finalize the current book and add it to the collection
   */
  private finalizeCurrentBook(): void {
    if (this.state.currentBook) {
      this.state.books.push(this.state.currentBook);
      this.state.currentBook = undefined;
    }
  }

  /**
   * Generate a unique verse ID
   */
  private generateVerseId(): string {
    if (this.state.currentBook && this.state.currentChapter && this.state.currentVerse) {
      return `${this.state.currentBook.id}-${this.state.currentChapter.number}-${this.state.currentVerse.number}`;
    }
    return `unknown-${Date.now()}`;
  }

  /**
   * Parse cross-reference content into VerseReference objects
   */
  private parseCrossReferences(content: string): VerseReference[] {
    // This is a simplified parser - in reality, cross-references can be quite complex
    const references: VerseReference[] = [];
    
    // Match patterns like "Gen 1:1", "Matt 5:3-7", etc.
    const refPattern = /([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/g;
    let match;
    
    while ((match = refPattern.exec(content)) !== null) {
      const [, bookName, chapter, startVerse, endVerse] = match;
      const bookId = this.getBookIdFromName(bookName.trim());
      
      if (bookId) {
        references.push({
          bookId,
          chapter: parseInt(chapter, 10),
          verse: parseInt(startVerse, 10),
          endVerse: endVerse ? parseInt(endVerse, 10) : undefined
        });
      }
    }
    
    return references;
  }

  /**
   * Get book name from book ID
   */
  private getBookName(bookId: string): string {
    // This would typically come from a lookup table
    const bookNames: Record<string, string> = {
      'gen': 'Genesis',
      'exo': 'Exodus',
      'mat': 'Matthew',
      'mrk': 'Mark',
      // ... add more as needed
    };
    
    return bookNames[bookId] || bookId.toUpperCase();
  }

  /**
   * Get book abbreviation from book ID
   */
  private getBookAbbreviation(bookId: string): string {
    return bookId.toUpperCase();
  }

  /**
   * Determine testament from book ID
   */
  private getTestament(bookId: string): 'old' | 'new' {
    const newTestamentBooks = [
      'mat', 'mrk', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph',
      'php', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas',
      '1pe', '2pe', '1jn', '2jn', '3jn', 'jud', 'rev'
    ];
    
    return newTestamentBooks.includes(bookId) ? 'new' : 'old';
  }

  /**
   * Get book ID from book name or abbreviation
   */
  private getBookIdFromName(name: string): string | null {
    const nameMap: Record<string, string> = {
      'genesis': 'gen',
      'gen': 'gen',
      'exodus': 'exo',
      'exo': 'exo',
      'matthew': 'mat',
      'matt': 'mat',
      'mat': 'mat',
      'mark': 'mrk',
      'mrk': 'mrk',
      // ... add more mappings as needed
    };
    
    return nameMap[name.toLowerCase()] || null;
  }

  /**
   * Reset parser state
   */
  private resetState(): void {
    this.state = {
      verses: [],
      chapters: [],
      books: [],
      footnotes: [],
      crossReferences: []
    };
  }
}
