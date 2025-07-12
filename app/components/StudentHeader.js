// app/components/StudentHeader.js

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaGamepad, FaUser, FaRocket } from 'react-icons/fa'; // Added a logo icon

export default function StudentHeader() {
  const pathname = usePathname();

  
  const navItems = [
    { href: '/quizzes', icon: FaHome, label: 'Quizzes' },
    { href: '/player/games', icon: FaGamepad, label: 'Games' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/quizzes" className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <FaRocket className="h-6 w-6 text-blue-500" />
              <span>SpeakAndLearn</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex md:items-center md:gap-8">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Profile Icon */}
          <div className="hidden md:block">
            <Link href="/player/profile" className="rounded-full bg-gray-200 p-2 text-gray-500 transition hover:bg-gray-300 hover:text-gray-700">
              <FaUser className="h-6 w-6" />
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}