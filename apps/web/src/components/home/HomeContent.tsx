'use client';

import React from 'react';
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { BibleBook, ReadingHistory, ReadingPlan, formatDate } from '@bible/shared';

interface HomeContentProps {
  currentBook: string | null;
  currentChapter: number | null;
  currentBookData: BibleBook | null;
  recentHistory: ReadingHistory[];
  activeReadingPlan: ReadingPlan | null;
}

export function HomeContent({
  currentBook,
  currentChapter,
  currentBookData,
  recentHistory,
  activeReadingPlan,
}: HomeContentProps) {
  const quickActions = [
    {
      icon: MagnifyingGlassIcon,
      label: 'Search',
      description: 'Find verses and passages',
      color: 'bg-blue-500',
      href: '/search',
    },
    {
      icon: HeartIcon,
      label: 'Favorites',
      description: 'Your saved verses',
      color: 'bg-red-500',
      href: '/favorites',
    },
    {
      icon: DocumentTextIcon,
      label: 'Notes',
      description: 'Study notes and insights',
      color: 'bg-yellow-500',
      href: '/notes',
    },
    {
      icon: CalendarIcon,
      label: 'Reading Plans',
      description: 'Structured Bible reading',
      color: 'bg-green-500',
      href: '/plans',
    },
    {
      icon: PhotoIcon,
      label: 'Quote Creator',
      description: 'Create verse images',
      color: 'bg-purple-500',
      href: '/quotes',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Good morning!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {formatDate(new Date(), 'long')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Reading Card */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <BookOpenIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Continue Reading
              </h2>
            </div>
            
            {currentBook && currentChapter ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {currentBookData?.name || currentBook} {currentChapter}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Pick up where you left off
                </p>
                <button className="btn-primary">
                  Continue Reading
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Start Your Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Begin reading the Bible today
                </p>
                <button className="btn-primary">
                  Start Reading
                </button>
              </div>
            )}
          </div>

          {/* Reading Plan Card */}
          {activeReadingPlan && (
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <CalendarIcon className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {activeReadingPlan.name}
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {activeReadingPlan.description}
              </p>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Day {activeReadingPlan.readings.filter(r => r.completed).length + 1} of {activeReadingPlan.duration}
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(activeReadingPlan.readings.filter(r => r.completed).length / activeReadingPlan.duration) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-8">
          {/* Recent Reading */}
          {recentHistory.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Recent Reading
                </h3>
              </div>
              
              <div className="space-y-3">
                {recentHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {item.bookId} {item.chapter}
                        {item.verse ? `:${item.verse}` : ''}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.timestamp, 'time')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verse of the Day */}
          <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-4">
              Verse of the Day
            </h3>
            
            <blockquote className="text-primary-800 dark:text-primary-200 mb-4 italic">
              "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future."
            </blockquote>
            
            <cite className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Jeremiah 29:11
            </cite>
          </div>

          {/* Statistics */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Your Progress
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Verses Read</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">1,247</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Days Streak</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">12</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Favorites</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">23</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Notes</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
