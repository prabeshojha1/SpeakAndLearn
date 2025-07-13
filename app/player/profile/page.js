
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSupabase } from '@/app/context/SupabaseContext';
import { useRequireAuth } from '@/app/hooks/useAuthGuard';
import AuthGuard from '@/app/components/AuthGuard';
import StudentFooter from '@/app/components/StudentFooter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Hardcoded data for the student's profile (existing data)
const profile = {
  name: 'Alex',
  avatar: '/pictures/cat-sleeps-on-windowsill-fluffy-600nw-2179489933.webp',
  highScores: [
    { quizId: 2, title: 'Plant Life Cycle', score: '100%', subject: 'Science' },
    { quizId: 3, title: 'History of Australia', score: '95%', subject: 'History' },
  ],
  notYetPlayed: [
      { quizId: 1, title: 'Life Cycles of a Plant', subject: 'Science' }
  ]
};

const subjectColors = {
  Science: 'bg-green-100 text-green-800 border-green-200',
  History: 'bg-red-100 text-red-800 border-red-200',
  Default: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Dummy data for quizzes progress (8 quizzes) to be later added from database
const quizzesProgressData = [
  { name: 'Quiz 1', points: 50 },
  { name: 'Quiz 2', points: 70 },
  { name: 'Quiz 3', points: 60 },
  { name: 'Quiz 4', points: 80 },
  { name: 'Quiz 5', points: 75 },
  { name: 'Quiz 6', points: 90 },
  { name: 'Quiz 7', points: 85 },
  { name: 'Quiz 8', points: 95 },
];

// Dummy data for games progress (5 games) to be alter added from database
const gamesProgressData = [
  { name: 'Game 1', points: 100 },
  { name: 'Game 2', points: 120 },
  { name: 'Game 3', points: 110 },
  { name: 'Game 4', points: 130 },
  { name: 'Game 5', points: 125 },
];

function ProfileContent() {
  const { user } = useRequireAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* Added pb-20 for footer spacing */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
            {/* User Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex items-center space-x-6">
                <div className="relative w-24 h-24">
                    <Image
                        src={profile.avatar}
                        alt="User Avatar"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                    />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Hello, {user?.email || profile.name}!
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">Welcome back, ready for a new challenge?</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Account: {user?.email}
                    </div>
                </div>
            </div>
          
          {/* Progress Graphs Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Progress (Percentage)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={quizzesProgressData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="points" stroke="#8884d8" activeDot={{ r: 8 }} name="Percentage" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Progress (Percentage)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gamesProgressData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="points" stroke="#82ca9d" activeDot={{ r: 8 }} name="Percentage" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* High Scores and Let's Try These! Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">My High Scores</h2>
                <div className="space-y-4">
                    {profile.highScores.map(score => {
                        const color = subjectColors[score.subject] || subjectColors.Default;
                        return (
                            <div key={score.quizId} className={`p-4 rounded-xl border-l-4 ${color}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">{score.title}</span>
                                    <span className="text-xl font-bold">{score.score}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Let's Try These!</h2>
                <div className="space-y-4">
                    {profile.notYetPlayed.map(game => (
                    <Link href={`/quizzes/${game.quizId}`} key={game.quizId}>
                        <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-700">{game.title}</span>
                                <span className="text-lg font-bold text-blue-500 hover:text-blue-600 transition-colors">Play Now &rarr;</span>
                            </div>
                        </div>
                    </Link>
                    ))}
                </div>
            </div>
          </div>

        </div>
      </main>
      <StudentFooter />
    </div>
  );
}

export default function PlayerProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <ProfileContent />
    </AuthGuard>
  );
}
