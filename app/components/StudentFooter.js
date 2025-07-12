// app/components/StudentFooter.js

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaGamepad, FaUser } from 'react-icons/fa';

export default function StudentFooter() {
  const pathname = usePathname();


  const navItems = [
    { href: '/quizzes', icon: FaHome, label: 'Quizzes' },
    { href: '/player/games', icon: FaGamepad, label: 'Games' },
    { href: '/player/profile', icon: FaUser, label: 'Profile' },
  ];

  return (

    <footer className="sticky bottom-0 z-50 md:hidden bg-white/80 backdrop-blur-lg border-t border-gray-200/60">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex flex-col items-center justify-center w-20 h-full transition-colors duration-300
                  ${
                    isActive
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-blue-500'
                  }`}
              >
                <item.icon size={24} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </footer>
  );
}