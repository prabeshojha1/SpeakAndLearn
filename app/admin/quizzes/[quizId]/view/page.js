
"use client";

import Link from 'next/link';
import { useQuiz } from '@/app/context/QuizContext';
import { useEffect, useState } from 'react';
import { use } from 'react';

const subjectTextColors = {
  Science: 'text-green-600',
  History: 'text-red-600',
  Maths: 'text-blue-600',
  English: 'text-yellow-800',
  Geography: 'text-purple-600',
  Default: 'text-gray-600'
};

export default function ViewQuizPage({ params }) {
  const { quizId } = use(params);
  const { getQuizById, getQuestionsByQuizId } = useQuiz();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuizAndQuestions = async () => {
      const foundQuiz = getQuizById(quizId);
      setQuiz(foundQuiz);

      if (foundQuiz) {
        const questions = await getQuestionsByQuizId(quizId);
        setQuestions(questions);
      }
    }

    fetchQuizAndQuestions();
    
  }, [quizId, getQuizById, getQuestionsByQuizId]);

  if (!quiz) {
    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center">
            <p className="text-xl text-pink-500">Loading quiz...</p>
        </div>
    );
  }

  console.log("Quiz Data:", quiz);
  console.log("Questions Data:", questions);

  return (
    <div className="min-h-screen bg-pink-50">
       <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/admin/quizzes" className="text-pink-500 hover:text-pink-700 font-bold">
                        &larr; Back to Quizzes
                    </Link>
                    <h1 className={`text-2xl font-bold ${subjectTextColors[quiz.subject] || subjectTextColors.Default}`}>{quiz.title}</h1>
                </div>
            </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Images in this Quiz</h2>
            {questions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {questions.map((q, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <img src={q.imageUrl} alt={`Question ${index + 1}`} className="w-full h-40 object-cover rounded-lg bg-gray-200 mb-3" />
                            <p className="text-sm text-gray-700"><span className="font-bold">Answer:</span> {q.answer}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No images have been added to this quiz yet.</p>
            )}
        </div>
      </main>
    </div>
  );
}
