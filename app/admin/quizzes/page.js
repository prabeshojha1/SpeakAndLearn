
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
  const { quizzes, loading, error, refreshQuizzes } = useQuiz();

  if (loading) {
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error loading quizzes</p>
              <p>{error}</p>
            </div>
            <button 
              onClick={refreshQuizzes}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

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
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">No quizzes created yet</p>
              <p>Click "New Quiz" to create your first quiz!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map(quiz => (
              <div 
                key={quiz.id} 
                className={`p-4 rounded-2xl border-2 shadow-sm flex justify-between items-center ${subjectColors[quiz.subject] || subjectColors.Default}`}
              >
                <Link href={`/admin/quizzes/${quiz.id}/view`} className="flex-grow">
                  <h2 className="text-xl font-bold text-gray-800">{quiz.title}</h2>
                  <p className="text-gray-600">{quiz.description}</p>
                  {quiz.difficulty && (
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </span>
                  )}
                </Link>
                <button className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                  <FaTrash size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
