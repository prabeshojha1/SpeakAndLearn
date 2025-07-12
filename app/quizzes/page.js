
"use client";

import Link from 'next/link';
import { useQuiz } from '@/app/context/QuizContext';
import StudentFooter from '../components/StudentFooter';

const subjectColors = {
  Maths: { bg: 'bg-blue-100', border: 'hover:border-blue-400', tag: 'bg-blue-200 text-blue-800' },
  Science: { bg: 'bg-green-100', border: 'hover:border-green-400', tag: 'bg-green-200 text-green-800' },
  English: { bg: 'bg-yellow-100', border: 'hover:border-yellow-400', tag: 'bg-yellow-200 text-yellow-800' },
  History: { bg: 'bg-red-100', border: 'hover:border-red-400', tag: 'bg-red-200 text-red-800' },
  Geography: { bg: 'bg-purple-100', border: 'hover:border-purple-400', tag: 'bg-purple-200 text-purple-800' },
  Default: { bg: 'bg-gray-100', border: 'hover:border-gray-400', tag: 'bg-gray-200 text-gray-800' },
};

export default function PlayerQuizzesPage() {
  const { quizzes, loading, error, refreshQuizzes } = useQuiz();

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient">
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Explore Quizzes</h1>
            <p className="text-lg text-gray-600">Choose a topic to start learning!</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
          </div>
        </main>
        <StudentFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen animated-gradient">
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Explore Quizzes</h1>
            <p className="text-lg text-gray-600">Choose a topic to start learning!</p>
          </div>
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
        <StudentFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 text-center">
             <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Explore Quizzes</h1>
             <p className="text-lg text-gray-600">Choose a topic to start learning!</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">No quizzes available</p>
              <p>Check back later for new quizzes!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map(quiz => {
              const colors = subjectColors[quiz.subject] || subjectColors.Default;
              return (
                  <Link href={`/quizzes/${quiz.id}`} key={quiz.id}>
                    <div className={`bg-white/70 ${colors.bg} rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border-2 border-transparent ${colors.border}`}>
                      <div className="p-6">
                        <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${colors.tag} mb-3`}>
                          {quiz.subject}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
                        <p className="text-gray-600">{quiz.description}</p>
                        {quiz.difficulty && (
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
              )
            })}
          </div>
        )}
      </main>
      <StudentFooter />
    </div>
  );
}
