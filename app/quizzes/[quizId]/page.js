
"use client";

import Link from 'next/link';
import React from 'react';
import StudentHeader from '@/app/components/StudentHeader';
import { useQuiz } from '@/app/context/QuizContext';
import { useEffect, useState } from 'react';

export default function QuizDetailPage({ params }) {
  const { quizId } = params;
  const { getQuizById } = useQuiz();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (quizId) {
      const foundQuiz = getQuizById(quizId);
      setQuiz(foundQuiz);
    }
  }, [quizId, getQuizById]);

  if (!quiz) {
    return <div className="min-h-screen animated-gradient flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen animated-gradient">
       <StudentHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="bg-white/80 p-8 rounded-2xl shadow-xl max-w-4xl w-full">
            <img src={quiz.coverImageUrl || '/placeholder.svg'} alt={quiz.title} className="w-full h-64 object-cover rounded-lg mb-6 bg-gray-200" />
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">{quiz.title}</h2>
            <p className="text-gray-700 mb-6 text-lg">{quiz.description}</p>
            
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-700">A Sneak Peek</h3>
                <div className="flex items-center gap-4 p-4 bg-pink-50/50 rounded-lg">
                    {quiz.questions.map((q, index) => (
                        <React.Fragment key={q.imageUrl + index}>
                            <img src={q.imageUrl} alt={`Question ${index + 1}`} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg bg-gray-200 shadow-sm" />
                            {index < quiz.questions.length - 1 && <div className="text-2xl font-bold text-pink-400">&rarr;</div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <p className="text-lg font-semibold mb-8 text-gray-600">Expected time: {quiz.expectedTimeSec ? `${Math.floor(quiz.expectedTimeSec / 60)} minutes` : 'N/A'}</p>

            <Link href={`/quizzes/${quiz.id}/play`}>
                <button className="w-full bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-2xl hover:bg-pink-600 transition-all transform hover:scale-105 shadow-lg">
                    Let's Go!
                </button>
            </Link>
        </div>
      </main>
    </div>
  );
}
