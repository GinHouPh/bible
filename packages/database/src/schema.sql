-- Bible data tables
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bible_books (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    testament TEXT NOT NULL CHECK (testament IN ('old', 'new')),
    book_order INTEGER NOT NULL,
    genre TEXT,
    author TEXT,
    written_date TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES bible_versions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bible_chapters (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    number INTEGER NOT NULL,
    title TEXT,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES bible_books(id) ON DELETE CASCADE,
    UNIQUE(book_id, number)
);

CREATE TABLE IF NOT EXISTS bible_verses (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL,
    number INTEGER NOT NULL,
    text TEXT NOT NULL,
    usfm_markers TEXT, -- JSON array of USFM markers
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES bible_chapters(id) ON DELETE CASCADE,
    UNIQUE(chapter_id, number)
);

CREATE TABLE IF NOT EXISTS footnotes (
    id TEXT PRIMARY KEY,
    verse_id TEXT NOT NULL,
    marker TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('explanation', 'translation', 'textual', 'reference')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (verse_id) REFERENCES bible_verses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cross_references (
    id TEXT PRIMARY KEY,
    verse_id TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (verse_id) REFERENCES bible_verses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cross_reference_verses (
    id TEXT PRIMARY KEY,
    cross_reference_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    end_verse INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cross_reference_id) REFERENCES cross_references(id) ON DELETE CASCADE
);

-- User data tables
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY,
    theme TEXT NOT NULL DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    font_size INTEGER NOT NULL DEFAULT 16,
    font_family TEXT NOT NULL DEFAULT 'serif' CHECK (font_family IN ('serif', 'sans-serif', 'monospace')),
    line_height REAL NOT NULL DEFAULT 1.6,
    default_bible_version TEXT,
    parallel_version TEXT,
    enable_parallel_reading BOOLEAN NOT NULL DEFAULT 0,
    enable_voice_narration BOOLEAN NOT NULL DEFAULT 0,
    daily_reminder BOOLEAN NOT NULL DEFAULT 0,
    reminder_time TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    auto_sync BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_highlights (
    id TEXT PRIMARY KEY,
    verse_id TEXT NOT NULL,
    color TEXT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_notes (
    id TEXT PRIMARY KEY,
    verse_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT, -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_favorites (
    id TEXT PRIMARY KEY,
    verse_id TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reading_history (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER,
    duration INTEGER, -- in seconds
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reading_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('yearly', 'topical', 'chronological', 'custom')),
    duration INTEGER NOT NULL, -- in days
    is_active BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reading_plan_days (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    day INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES reading_plans(id) ON DELETE CASCADE,
    UNIQUE(plan_id, day)
);

CREATE TABLE IF NOT EXISTS reading_plan_readings (
    id TEXT PRIMARY KEY,
    plan_day_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    end_verse INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_day_id) REFERENCES reading_plan_days(id) ON DELETE CASCADE
);

-- Search and indexing tables
CREATE TABLE IF NOT EXISTS search_index (
    id INTEGER PRIMARY KEY,
    word TEXT NOT NULL,
    verse_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (verse_id) REFERENCES bible_verses(id) ON DELETE CASCADE
);

-- Quote creator tables
CREATE TABLE IF NOT EXISTS quote_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    background_image TEXT,
    background_color TEXT,
    text_style TEXT NOT NULL, -- JSON object
    layout TEXT NOT NULL, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_quotes (
    id TEXT PRIMARY KEY,
    verse_text TEXT NOT NULL,
    reference TEXT NOT NULL,
    template_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES quote_templates(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bible_books_version ON bible_books(version_id);
CREATE INDEX IF NOT EXISTS idx_bible_chapters_book ON bible_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_bible_verses_chapter ON bible_verses(chapter_id);
CREATE INDEX IF NOT EXISTS idx_footnotes_verse ON footnotes(verse_id);
CREATE INDEX IF NOT EXISTS idx_cross_references_verse ON cross_references(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_highlights_verse ON user_highlights(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_verse ON user_notes(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_verse ON user_favorites(verse_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_book_chapter ON reading_history(book_id, chapter);
CREATE INDEX IF NOT EXISTS idx_reading_history_timestamp ON reading_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_index_word ON search_index(word);
CREATE INDEX IF NOT EXISTS idx_search_index_verse ON search_index(verse_id);

-- Full-text search virtual table for verses
CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
    verse_id,
    book_name,
    chapter_number,
    verse_number,
    text,
    content='bible_verses',
    content_rowid='rowid'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS verses_fts_insert AFTER INSERT ON bible_verses BEGIN
    INSERT INTO verses_fts(verse_id, text) VALUES (new.id, new.text);
END;

CREATE TRIGGER IF NOT EXISTS verses_fts_delete AFTER DELETE ON bible_verses BEGIN
    DELETE FROM verses_fts WHERE verse_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS verses_fts_update AFTER UPDATE ON bible_verses BEGIN
    DELETE FROM verses_fts WHERE verse_id = old.id;
    INSERT INTO verses_fts(verse_id, text) VALUES (new.id, new.text);
END;
