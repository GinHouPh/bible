'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { useBibleStore, useUserStore } from '@bible/shared';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const { setVersions } = useBibleStore();

  useEffect(() => {
    setMounted(true);
    
    // Initialize with sample data for development
    const initializeApp = async () => {
      try {
        // Load sample Bible data
        const sampleVersion = {
          id: 'ESV',
          name: 'English Standard Version',
          abbreviation: 'ESV',
          language: 'English',
          languageCode: 'en',
          books: [
            {
              id: 'gen',
              name: 'Genesis',
              abbreviation: 'Gen',
              testament: 'old' as const,
              chapters: [
                {
                  number: 1,
                  verses: [
                    {
                      number: 1,
                      text: 'In the beginning, God created the heavens and the earth.'
                    },
                    {
                      number: 2,
                      text: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.'
                    },
                    {
                      number: 3,
                      text: 'And God said, "Let there be light," and there was light.'
                    }
                  ]
                }
              ]
            },
            {
              id: 'jhn',
              name: 'John',
              abbreviation: 'Jhn',
              testament: 'new' as const,
              chapters: [
                {
                  number: 1,
                  verses: [
                    {
                      number: 1,
                      text: 'In the beginning was the Word, and the Word was with God, and the Word was God.'
                    },
                    {
                      number: 2,
                      text: 'He was in the beginning with God.'
                    },
                    {
                      number: 3,
                      text: 'All things were made through him, and without him was not any thing made that was made.'
                    }
                  ]
                }
              ]
            }
          ]
        };
        
        setVersions([sampleVersion]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [setVersions]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bible App...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
