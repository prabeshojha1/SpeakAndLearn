
"use client";

import Link from 'next/link';
import StudentHeader from '@/app/components/StudentHeader';
import { useQuiz } from '@/app/context/QuizContext';

const subjectColors = {
  Maths: { bg: 'bg-blue-100', border: 'hover:border-blue-400', tag: 'bg-blue-200 text-blue-800' },
  Science: { bg: 'bg-green-100', border: 'hover:border-green-400', tag: 'bg-green-200 text-green-800' },
  English: { bg: 'bg-yellow-100', border: 'hover:border-yellow-400', tag: 'bg-yellow-200 text-yellow-800' },
  History: { bg: 'bg-red-100', border: 'hover:border-red-400', tag: 'bg-red-200 text-red-800' },
  Geography: { bg: 'bg-purple-100', border: 'hover:border-purple-400', tag: 'bg-purple-200 text-purple-800' },
  Default: { bg: 'bg-gray-100', border: 'hover:border-gray-400', tag: 'bg-gray-200 text-gray-800' },
};

export default function PlayerQuizzesPage() {
  const { quizzes } = useQuiz();

  return (
    <div className="min-h-screen animated-gradient">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 text-center">
             <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Explore Quizzes</h1>
             <p className="text-lg text-gray-600">Choose a topic to start learning!</p>
        </div>

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
                    </div>
                  </div>
                </Link>
            )
          })}
        </div>
      </main>
      <StudentHeader />
    </div>
  );
}
