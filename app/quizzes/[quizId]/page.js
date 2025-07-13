
"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuiz } from '@/app/context/QuizContext';
import { useRequireAuth } from '@/app/hooks/useAuthGuard';
import AuthGuard from '@/app/components/AuthGuard';
import StudentFooter from '@/app/components/StudentFooter';

const subjectColors = {
  Science: 'bg-green-100 text-green-800',
  History: 'bg-red-100 text-red-800',
  Maths: 'bg-blue-100 text-blue-800',
  English: 'bg-yellow-100 text-yellow-800',
  Geography: 'bg-purple-100 text-purple-800',
  Default: 'bg-gray-100 text-gray-800'
};

function QuizDetailContent({ params }) {
  const { quizId } = use(params);
  const { getQuizById } = useQuiz();
  const { user } = useRequireAuth();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const foundQuiz = getQuizById(quizId);
    setQuiz(foundQuiz);
  }, [quizId, getQuizById]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/quizzes" className="text-blue-500 hover:text-blue-700 font-semibold mb-4 inline-block">
              &larr; Back to Quizzes
            </Link>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{quiz.title}</h1>
              {user && (
                <p className="text-lg text-gray-600">Playing as: {user.email}</p>
              )}
            </div>
          </div>

          {/* Quiz Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className={`relative h-64 ${quiz.bannerUrl ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
              {quiz.bannerUrl && (
                <Image
                  src={quiz.bannerUrl}
                  alt={quiz.title}
                  fill
                  className="object-cover"
                />
              )}
              {/* Backdrop blur overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-black/40"></div>
              {/* Text overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800">{quiz.title}</h2>
                  <p className="text-lg text-gray-600">{quiz.description || 'No description available'}</p>
                </div>
              </div>
            </div>

            {/* Quiz Info */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Subject</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${subjectColors[quiz.subject] || subjectColors.Default}`}>
                    {quiz.subject}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Difficulty</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quiz.difficulty ? quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1) : 'Not specified'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Questions</h3>
                  <p className="text-gray-600">{quiz.questions?.length || 0} questions</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Time per Question</h3>
                  <p className="text-gray-600">{quiz.timePerQuestion || 30} seconds</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Quiz</h3>
                <p className="text-gray-600 leading-relaxed">{quiz.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/quizzes/${quizId}/play`}>
                  <button className="w-full sm:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-lg transition-colors transform hover:scale-105">
                    Start Quiz
                  </button>
                </Link>
                <Link href={`/quizzes/${quizId}/results`}>
                  <button className="w-full sm:w-auto px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg text-lg transition-colors">
                    View Results
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}

export default function QuizDetailPage({ params }) {
  return (
    <AuthGuard requireAuth={true}>
      <QuizDetailContent params={params} />
    </AuthGuard>
  );
}
