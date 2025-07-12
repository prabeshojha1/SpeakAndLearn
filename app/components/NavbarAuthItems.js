// app/components/NavbarAuthItems.js
"use client";

import Link from 'next/link';
import { useSupabase } from '../context/SupabaseContext';
import { usePathname } from 'next/navigation';

export default function NavbarAuthItems() {
    const { user } = useSupabase();
    const pathname = usePathname();

    return (
        <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
                <Link 
                    href={user ? "/quizzes" : "/auth"} 
                    className={`text-base font-medium transition-colors hover:text-blue-600 ${
                        pathname.startsWith('/quizzes') 
                          ? 'text-blue-600' 
                          : 'text-gray-600'
                      }`}
                >
                    Quizzes
                </Link>
                <Link 
                    href={user ? "/games" : "/auth"} 
                    className={`text-base font-medium transition-colors hover:text-blue-600 ${
                        pathname.startsWith('/games') 
                          ? 'text-blue-600' 
                          : 'text-gray-600'
                      }`}
                >
                    Games
                </Link>
            </nav>

            <Link href="/auth">
                <button className="px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-400 text-slate-800 shadow-sm hover:bg-yellow-500 transition-colors">
                Get Started
                </button>
            </Link>
        </div>
    );
}