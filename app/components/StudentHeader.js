// app/components/StudentHeader.js

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSupabase } from '../context/SupabaseContext';
import AuthControls from './AuthControls';

export default function StudentHeader() {
  const pathname = usePathname();
  const { user } = useSupabase();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          <div className="flex-shrink-0">
            <Link href="/quizzes" className="flex items-center gap-3">
              <Image 
                src="/image.webp" 
                alt="SpeakAndLearn Logo" 
                width={56}
                height={56}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-gray-900">SpeakAndLearn.ai</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/quizzes"
                className={`text-base font-medium transition-colors hover:text-blue-600 ${
                  pathname.startsWith('/quizzes') 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                Quizzes
              </Link>
              
              <Link
                href="/player/games"
                className={`text-base font-medium transition-colors hover:text-blue-600 ${
                  pathname.startsWith('/player/games') 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                Games
              </Link>

              {user && (
                <Link
                  href="/player/profile"
                  className={`text-base font-medium transition-colors hover:text-blue-600 ${
                    pathname.startsWith('/player/profile') 
                      ? 'text-blue-600' 
                      : 'text-gray-600'
                  }`}
                >
                  Profile
                </Link>
              )}
            </nav>
            <AuthControls />
          </div>

        </div>
      </div>
    </header>
  );
}