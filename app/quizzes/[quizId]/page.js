
"use client";

import Link from 'next/link';
import React, { useState, use } from 'react';
import { useQuiz } from '@/app/context/QuizContext';
import { useSupabase } from '@/app/context/SupabaseContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizDetailPage({ params }) {
  const { quizId } = use(params);
  const { getQuizById } = useQuiz();
  const { supabase } = useSupabase();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (quizId) {
      const foundQuiz = getQuizById(quizId);
      setQuiz(foundQuiz);
    }
  }, [quizId, getQuizById]);

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      // Get the current session to include in the API call
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to start the quiz.');
        router.push('/auth');
        return;
      }

      console.log('Quiz ID (integer):', quizId, typeof quizId);
      console.log('User ID:', session.user.id);

      // Create game session using the database helper via API
      const response = await fetch('/api/game-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          quizId: quizId // Now a proper UUID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start quiz');
      }

      const gameSession = await response.json();
      console.log('Game session created:', gameSession);
      
      // Redirect to play page
      router.push(`/quizzes/${quiz.id}/play`);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!quiz) {
    return <div className="min-h-screen animated-gradient flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen animated-gradient flex flex-col"> {/* Keep min-h-screen and gradient here, make it a column flex container */}
      <main className="flex-grow flex items-center justify-center container mx-auto p-4 sm:p-6 lg:p-8"> {/* Main takes all available space and centers its content */}
        <div className="bg-white/80 p-8 rounded-2xl shadow-xl max-w-4xl w-full">
            <img src={quiz.coverImageUrl || '/placeholder.svg'} alt={quiz.title} className="w-full h-64 object-cover rounded-lg mb-6 bg-gray-200" />
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">{quiz.title}</h2>
            <p className="text-gray-700 mb-6 text-lg">{quiz.description}</p>
            
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-700">A Sneak Peek</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg"> {/* Changed to grid, responsive columns, and neutral background */}
                    {quiz.questions.map((q, index) => (
                        <div key={q.imageUrl + index} className="relative w-full aspect-square"> {/* Use aspect-square to ensure square images */}
                            <img src={q.imageUrl} alt={`Question ${index + 1}`} className="object-cover rounded-lg bg-gray-200 shadow-sm w-full h-full" /> {/* Make image fill its square container */}
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-lg font-semibold mb-8 text-gray-600">Expected time: {quiz.expectedTimeSec ? `${Math.floor(quiz.expectedTimeSec / 60)} minutes` : 'N/A'}</p>

            <button 
              onClick={handleStartQuiz}
              disabled={isLoading}
              className="w-full bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-2xl hover:bg-pink-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Starting Quiz...' : "Let's Go!"}
            </button>
        </div>
      </main>
    </div>
  );
}
