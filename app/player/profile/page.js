
"use client";

import Link from 'next/link';
import StudentHeader from '@/app/components/StudentHeader';

// Hardcoded data for the student's profile
const profile = {
  name: 'Alex',
  highScores: [
    { quizId: 2, title: 'The Solar System', score: '10/10', subject: 'Science' },
    { quizId: 3, title: 'World War II', score: '8/10', subject: 'History' },
  ],
  notYetPlayed: [
      { quizId: 1, title: 'Life Cycles of a Plant', subject: 'Science' }
  ]
};

const subjectColors = {
  Science: 'bg-green-100 text-green-800',
  History: 'bg-red-100 text-red-800',
  Default: 'bg-gray-100 text-gray-800',
};


export default function PlayerProfilePage() {
  return (
    <div className="min-h-screen animated-gradient">
      <StudentHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white/80 p-8 rounded-2xl shadow-xl max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Hello, {profile.name}!</h1>
          
          <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-pink-700 mb-4">My High Scores</h2>
                {profile.highScores.map(score => {
                    const color = subjectColors[score.subject] || subjectColors.Default;
                    return (
                        <div key={score.quizId} className={`flex justify-between items-center p-4 rounded-xl mb-3 ${color}`}>
                            <span className="font-bold">{score.title}</span>
                            <span className="text-2xl font-bold">{score.score}</span>
                        </div>
                    )
                })}
            </div>

            <div>
                <h2 className="text-2xl font-bold text-pink-700 mb-4">Let's Try These!</h2>
                {profile.notYetPlayed.map(game => (
                <Link href={`/quizzes/${game.quizId}`} key={game.quizId}>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-pink-100/50 hover:bg-pink-100 transition-colors cursor-pointer mb-3">
                        <span className="font-bold text-pink-800">{game.title}</span>
                        <span className="text-lg font-bold text-pink-500">Play Now &rarr;</span>
                    </div>
                </Link>
                ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
