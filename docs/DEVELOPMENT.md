# Development Guide

This guide covers the development setup, architecture decisions, and best practices for the Bible App project.

## Project Architecture

### Monorepo Structure

The project uses a monorepo structure with npm workspaces to share code between platforms:

```
bible/
├── apps/                    # Platform-specific applications
│   ├── mobile/             # React Native + Expo
│   ├── web/                # Next.js
│   └── desktop/            # Electron
├── packages/               # Shared packages
│   ├── shared/             # Common types, utilities, state
│   ├── bible-parser/       # USFM parsing logic
│   └── database/           # Database abstraction
└── data/                   # Sample Bible data
```

### Technology Choices

#### Frontend Frameworks
- **React Native + Expo**: Maximum code reuse between iOS and Android
- **Next.js**: Modern React framework with SSR/SSG capabilities
- **Electron**: Desktop app wrapper for web technologies

#### State Management
- **Zustand**: Lightweight, TypeScript-friendly state management
- **Persistence**: Automatic state persistence across sessions

#### Database
- **SQLite**: Reliable, file-based database for desktop/mobile
- **SQL.js**: SQLite compiled to WebAssembly for web compatibility

#### Styling
- **Tailwind CSS**: Utility-first CSS framework for web
- **React Native StyleSheet**: Platform-native styling for mobile

## Development Setup

### Prerequisites

```bash
# Node.js and npm
node --version  # Should be 18+
npm --version   # Should be 9+

# Platform-specific tools
expo --version  # For mobile development
```

### Initial Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/GinHouPh/bible.git
   cd bible
   npm install
   npm run setup
   ```

2. **Build shared packages**
   ```bash
   npm run build:shared
   ```

3. **Start development**
   ```bash
   # All platforms
   npm run dev

   # Individual platforms
   npm run dev:web
   npm run dev:mobile
   npm run dev:desktop
   ```

### Development Workflow

#### Code Organization

- **Shared Logic**: Place in `packages/shared/`
- **Platform-Specific**: Keep in respective `apps/` directories
- **Types**: Define in `packages/shared/src/types/`
- **Utilities**: Add to `packages/shared/src/utils/`

#### State Management

```typescript
// Define state in packages/shared/src/store/
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyState {
  data: string;
  setData: (data: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      data: '',
      setData: (data) => set({ data }),
    }),
    { name: 'my-store' }
  )
);
```

#### Adding New Features

1. **Define Types**: Add to `packages/shared/src/types/`
2. **Create Store**: Add state management if needed
3. **Implement Logic**: Add to appropriate package
4. **Create Components**: Platform-specific UI components
5. **Add Tests**: Write unit and integration tests
6. **Update Documentation**: Keep docs current

### Platform-Specific Development

#### Mobile (React Native + Expo)

```bash
cd apps/mobile

# Start development server
npm start

# Run on specific platform
npm run ios
npm run android

# Build for production
expo build:ios
expo build:android
```

**Key Files:**
- `App.tsx`: Main app component
- `src/navigation/`: Navigation setup
- `src/screens/`: Screen components
- `src/components/`: Reusable components

#### Web (Next.js)

```bash
cd apps/web

# Development server
npm run dev

# Build for production
npm run build
npm start
```

**Key Files:**
- `src/app/`: App Router pages and layouts
- `src/components/`: React components
- `tailwind.config.js`: Tailwind configuration
- `next.config.js`: Next.js configuration

#### Desktop (Electron)

```bash
cd apps/desktop

# Development
npm run dev

# Build for distribution
npm run electron:dist
```

**Key Files:**
- `src/main.ts`: Main Electron process
- `src/preload.ts`: Preload script for security
- `package.json`: Electron Builder configuration

### Database Development

#### Schema Changes

1. **Update SQL Schema**: Modify `packages/database/src/schema.sql`
2. **Update Types**: Add TypeScript types in `packages/shared/src/types/`
3. **Migration Logic**: Add migration functions if needed
4. **Test Changes**: Verify on all platforms

#### Database Operations

```typescript
import { BibleDatabase } from '@bible/database';

const db = new BibleDatabase({
  databasePath: './bible.db' // Desktop/Mobile
  // Web uses IndexedDB automatically
});

await db.initialize();
await db.saveBibleVersion(version);
const version = await db.getBibleVersion('ESV');
```

### USFM Parser Development

#### Adding New Markers

1. **Update Parser**: Modify `packages/bible-parser/src/usfm-parser.ts`
2. **Add Handler**: Create marker-specific processing logic
3. **Update Types**: Add new data structures if needed
4. **Test Parsing**: Verify with sample USFM files

#### Parser Usage

```typescript
import { USFMParser } from '@bible/parser';

const parser = new USFMParser();
const version = parser.parseUSFM(usfmText, {
  id: 'ESV',
  name: 'English Standard Version',
  // ... other metadata
});
```

## Testing

### Test Structure

```
__tests__/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

### Running Tests

```bash
# All tests
npm test

# Specific platform
cd apps/mobile && npm test
cd apps/web && npm test

# With coverage
npm run test -- --coverage

# Watch mode
npm run test:watch
```

### Writing Tests

```typescript
// Unit test example
import { formatVerseReference } from '@bible/shared';

describe('formatVerseReference', () => {
  it('should format single verse', () => {
    const ref = { bookId: 'gen', chapter: 1, verse: 1 };
    expect(formatVerseReference(ref)).toBe('Genesis 1:1');
  });
});
```

## Code Quality

### Linting and Formatting

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:
- Linting
- Type checking
- Test running
- Formatting

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## Performance Optimization

### Bundle Size

- Use dynamic imports for large features
- Implement code splitting
- Optimize images and assets
- Monitor bundle analyzer reports

### Runtime Performance

- Use React.memo for expensive components
- Implement virtualization for large lists
- Optimize database queries
- Use proper caching strategies

### Memory Management

- Clean up event listeners
- Dispose of database connections
- Implement proper cleanup in useEffect

## Debugging

### Development Tools

- **React DevTools**: Component inspection
- **Flipper**: React Native debugging
- **Chrome DevTools**: Web debugging
- **Electron DevTools**: Desktop debugging

### Common Issues

1. **Module Resolution**: Check tsconfig.json paths
2. **State Persistence**: Verify Zustand persist configuration
3. **Database Issues**: Check initialization and schema
4. **Build Failures**: Clear node_modules and rebuild

### Logging

```typescript
// Use consistent logging
console.log('[BibleApp]', 'Info message');
console.warn('[BibleApp]', 'Warning message');
console.error('[BibleApp]', 'Error message');
```

## Deployment

### Environment Setup

Create environment files for each platform:

```bash
# Web
apps/web/.env.local

# Mobile
apps/mobile/.env

# Desktop
apps/desktop/.env
```

### Build Process

```bash
# Production builds
npm run build

# Platform-specific builds
cd apps/web && npm run build
cd apps/mobile && expo build
cd apps/desktop && npm run electron:dist
```

### CI/CD Pipeline

The project uses GitHub Actions for:
- Automated testing
- Build verification
- Deployment to staging
- Release automation

## Contributing

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

### Code Review Guidelines

- Check for TypeScript compliance
- Verify cross-platform compatibility
- Review test coverage
- Validate documentation updates
- Test on multiple platforms

### Release Process

1. Update version numbers
2. Generate changelog
3. Create release branch
4. Build and test all platforms
5. Tag release
6. Deploy to app stores/hosting

## Troubleshooting

### Common Development Issues

#### Metro/Expo Issues
```bash
# Clear cache
expo start --clear
npx react-native start --reset-cache
```

#### TypeScript Issues
```bash
# Rebuild types
npm run build:shared
npx tsc --build --force
```

#### Database Issues
```bash
# Reset database
rm -rf user-data/
npm run dev
```

### Getting Help

- Check existing GitHub issues
- Review documentation
- Ask in GitHub Discussions
- Contact maintainers

## Best Practices

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Use efficient data structures

### Security
- Validate all user inputs
- Sanitize database queries
- Use secure storage for sensitive data
- Implement proper error handling

### Accessibility
- Add proper ARIA labels
- Support keyboard navigation
- Provide alternative text
- Test with screen readers

### Internationalization
- Use i18n libraries
- Externalize all strings
- Support RTL languages
- Test with different locales
