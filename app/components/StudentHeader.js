
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaGamepad, FaUser } from 'react-icons/fa';

export default function StudentHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: '/quizzes', icon: FaHome, label: 'Quizzes' },
    { href: '/player/games', icon: FaGamepad, label: 'Games' },
    { href: '/player/profile', icon: FaUser, label: 'Profile' },
  ];

  return (
    <footer className="bg-white shadow-lg z-10"> {/* Removed fixed positioning */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link href={item.href} key={item.label}>
                <div
                  className={`flex flex-col items-center justify-center w-20 h-full transition-colors duration-300 ${
                    isActive ? 'text-blue-500' : 'text-gray-500 hover:text-blue-400'
                  }`}
                >
                  <item.icon size={28} />
                  <span className="text-xs mt-1">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
