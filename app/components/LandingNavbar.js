// app/components/LandingNavbar.js
"use client";

import Link from 'next/link';
import { FaMicrophone } from 'react-icons/fa';

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
       
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <FaMicrophone className="h-6 w-6 text-blue-500" />
            <span>SpeakAndLearn.ai</span>
          </Link>

        
          <nav className="hidden md:flex items-center gap-8">
            <Link href="quizzes" className="text-sm font-medium text-slate-600 hover:text-slate-900">Quizzes</Link>
            <Link href="admin/quizzes" className="text-sm font-medium text-slate-600 hover:text-slate-900">Login</Link>
          </nav>

       
          <Link href="#">
            <button className="hidden md:block px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-400 text-slate-800 shadow-sm hover:bg-yellow-500 transition-colors">
              Get Started
            </button>
          </Link>

        </div>
      </div>
    </header>
  );
}