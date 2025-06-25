'use client';

import React, { useState } from 'react';
import {
  HomeIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useBibleStore, BOOK_NAMES, BIBLE_BOOKS_ORDER } from '@bible/shared';

export function Sidebar() {
  const { getCurrentVersion, navigateToBook } = useBibleStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    oldTestament: false,
    newTestament: false,
  });
  
  const currentVersion = getCurrentVersion();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getBooksByTestament = (testament: 'old' | 'new') => {
    if (!currentVersion) return [];
    
    return BIBLE_BOOKS_ORDER
      .filter(bookId => BOOK_NAMES[bookId]?.testament === testament)
      .map(bookId => {
        const bookInfo = BOOK_NAMES[bookId];
        const bookData = currentVersion.books.find(b => b.id === bookId);
        
        if (!bookData || !bookInfo) return null;
        
        return {
          id: bookId,
          name: bookInfo.name,
          abbreviation: bookInfo.abbreviation,
          chapters: bookData.chapters.length,
        };
      })
      .filter(Boolean);
  };

  const oldTestamentBooks = getBooksByTestament('old');
  const newTestamentBooks = getBooksByTestament('new');

  const navigationItems = [
    { icon: HomeIcon, label: 'Home', href: '/', active: true },
    { icon: BookOpenIcon, label: 'Bible', href: '/bible' },
    { icon: MagnifyingGlassIcon, label: 'Search', href: '/search' },
    { icon: HeartIcon, label: 'Favorites', href: '/favorites' },
    { icon: DocumentTextIcon, label: 'Notes', href: '/notes' },
    { icon: CalendarIcon, label: 'Reading Plans', href: '/plans' },
    { icon: PhotoIcon, label: 'Quote Creator', href: '/quotes' },
    { icon: Cog6ToothIcon, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="sidebar">
      <div className="p-4">
        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.active
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bible Books */}
        {currentVersion && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Bible Books
            </h3>
            
            <div className="mt-4 space-y-1">
              {/* Old Testament */}
              <div>
                <button
                  onClick={() => toggleSection('oldTestament')}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {expandedSections.oldTestament ? (
                    <ChevronDownIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 mr-2" />
                  )}
                  Old Testament ({oldTestamentBooks.length})
                </button>
                
                {expandedSections.oldTestament && (
                  <div className="ml-6 mt-1 space-y-1">
                    {oldTestamentBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => navigateToBook(book.id)}
                        className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <span>{book.name}</span>
                        <span className="text-xs text-gray-400">
                          {book.chapters}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* New Testament */}
              <div>
                <button
                  onClick={() => toggleSection('newTestament')}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {expandedSections.newTestament ? (
                    <ChevronDownIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 mr-2" />
                  )}
                  New Testament ({newTestamentBooks.length})
                </button>
                
                {expandedSections.newTestament && (
                  <div className="ml-6 mt-1 space-y-1">
                    {newTestamentBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => navigateToBook(book.id)}
                        className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <span>{book.name}</span>
                        <span className="text-xs text-gray-400">
                          {book.chapters}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
