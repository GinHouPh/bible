# Bible App - Cross-Platform Bible Study Application

A comprehensive Bible application that works seamlessly across Web, PC/Mac, Mobile, and Tablet platforms. Built with modern technologies to provide a rich, interactive Bible reading experience with advanced features for study, note-taking, and verse sharing.

## 🌟 Features

### Core Features
- **Cross-Platform**: Works on Web, Desktop (Windows/Mac/Linux), Mobile (iOS/Android), and Tablets
- **Multiple Bible Versions**: Support for various translations with parallel reading
- **Advanced Search**: Full-text search with filters and fuzzy matching
- **Personal Study Tools**: Notes, highlights, favorites, and bookmarks
- **Reading Plans**: Pre-built and custom reading plans with progress tracking
- **Quote Creator**: Create beautiful verse images with customizable backgrounds and text styles
- **Offline Support**: Full functionality without internet connection
- **Sync Across Devices**: Keep your data synchronized across all platforms

### Advanced Features
- **USFM Parser**: Parse and display Bible text from USFM (Unified Standard Format Markers) files
- **Cross-References**: Navigate between related verses
- **Footnotes**: Access detailed explanations and alternative translations
- **Voice Narration**: Text-to-speech functionality
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for all screen sizes
- **Keyboard Shortcuts**: Power user features for desktop

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: React Native with Expo (Mobile/Tablet) + Next.js (Web)
- **Desktop**: Electron wrapper
- **State Management**: Zustand with persistence
- **Database**: SQLite with SQL.js for web compatibility
- **Styling**: Tailwind CSS (Web) + React Native StyleSheet (Mobile)
- **Build System**: TypeScript monorepo with workspaces

### Project Structure
```
bible/
├── apps/
│   ├── mobile/          # React Native + Expo app
│   ├── web/             # Next.js web application
│   └── desktop/         # Electron desktop app
├── packages/
│   ├── shared/          # Shared types, utilities, and state management
│   ├── bible-parser/    # USFM parser and Bible data utilities
│   └── database/        # Database abstraction layer
├── data/
│   └── sample/          # Sample Bible data files
└── docs/                # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- For mobile development: Expo CLI
- For desktop development: Electron

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GinHouPh/bible.git
   cd bible
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run setup
   ```

3. **Start development servers**
   ```bash
   # Start all platforms
   npm run dev

   # Or start individual platforms
   npm run dev:web      # Web app (http://localhost:3000)
   npm run dev:mobile   # Mobile app (Expo)
   npm run dev:desktop  # Desktop app
   ```

### Development Commands

```bash
# Build all platforms
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```