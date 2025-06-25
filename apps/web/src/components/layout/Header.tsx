'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  MagnifyingGlassIcon, 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  Cog6ToothIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useBibleStore } from '@bible/shared';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { getCurrentVersion } = useBibleStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentVersion = getCurrentVersion();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme || 'system');
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="w-5 h-5" />;
      case 'dark':
        return <MoonIcon className="w-5 h-5" />;
      default:
        return <ComputerDesktopIcon className="w-5 h-5" />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Version */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Bible App
            </h1>
          </div>
          
          {currentVersion && (
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentVersion.name}
              </span>
            </div>
          )}
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search the Bible..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={`Current theme: ${theme || 'system'}`}
          >
            {getThemeIcon()}
          </button>

          {/* Settings */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
