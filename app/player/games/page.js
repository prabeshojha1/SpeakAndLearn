"use client";

import StudentFooter from '@/app/components/StudentFooter';

export default function PlayerGamesPage() {
  return (
    <div className="min-h-screen animated-gradient">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Games</h1>
          <p className="text-lg text-gray-600">Have fun with our interactive games!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Metaphors Card */}
          <div className="bg-white/70 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border-2 border-transparent hover:border-blue-400">
            <div className="p-6">
              <div className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-200 text-blue-800 mb-3">
                English
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Metaphors</h2>
              <p className="text-gray-600">Test your knowledge of metaphors!</p>
            </div>
          </div>
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}