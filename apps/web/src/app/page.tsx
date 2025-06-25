'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { HomeContent } from '@/components/home/HomeContent';
import { useBibleStore, useUserStore } from '@bible/shared';

export default function HomePage() {
  const { currentBook, currentChapter, getCurrentBook } = useBibleStore();
  const { getRecentHistory, getActiveReadingPlan } = useUserStore();

  const recentHistory = getRecentHistory(5);
  const activeReadingPlan = getActiveReadingPlan();
  const currentBookData = getCurrentBook();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <HomeContent
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentBookData={currentBookData}
            recentHistory={recentHistory}
            activeReadingPlan={activeReadingPlan}
          />
        </main>
      </div>
    </div>
  );
}
