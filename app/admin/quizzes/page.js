
"use client";

import Link from 'next/link';
import { useQuiz } from '@/app/context/QuizContext';
import { FaPlus, FaTrash } from 'react-icons/fa';

const subjectColors = {
  Maths: 'bg-blue-200 border-blue-400',
  Science: 'bg-green-200 border-green-400',
  English: 'bg-yellow-200 border-yellow-400',
  History: 'bg-red-200 border-red-400',
  Geography: 'bg-purple-200 border-purple-400',
  Default: 'bg-gray-200 border-gray-400',
};

export default function AdminQuizzesPage() {
  const { quizzes } = useQuiz();

  return (
    <div className="min-h-screen bg-pink-50">
      <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Quizzes</h1>
                <Link href="/admin/quizzes/new">
                    <button className="flex items-center gap-2 bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-transform hover:scale-105">
                        <FaPlus />
                        <span className="hidden sm:inline">New Quiz</span>
                    </button>
                </Link>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className={`p-4 rounded-2xl border-2 shadow-sm flex justify-between items-center ${subjectColors[quiz.subject] || subjectColors.Default}`}
            >
              <Link href={`/admin/quizzes/${quiz.id}/view`} className="flex-grow">
                <h2 className="text-xl font-bold text-gray-800">{quiz.title}</h2>
              </Link>
              <button className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                <FaTrash size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
