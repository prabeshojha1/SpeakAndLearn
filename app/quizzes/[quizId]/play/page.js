
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/app/context/QuizContext';

export default function QuizPlayPage({ params }) {
  const { quizId } = params;
  const router = useRouter();
  const { getQuizById } = useQuiz();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    const foundQuiz = getQuizById(quizId);
    setQuiz(foundQuiz);
  }, [quizId, getQuizById]);

  useEffect(() => {
    if (!quiz) return;

    setShowCountdown(true);
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownTimer);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, [currentQuestionIndex, quiz]);

  const startRecording = () => {
    setShowCountdown(false);
    setIsRecording(true);
    // Placeholder for actual recording logic
    console.log(`Recording for question ${currentQuestionIndex + 1}...`);
  };

  const handleNext = () => {
    setIsRecording(false);
    setCountdown(3);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      router.push(`/quizzes/${quizId}/results`);
    }
  };
  
  if (!quiz) {
    return <div className="min-h-screen animated-gradient flex items-center justify-center"><p>Loading Quiz...</p></div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen animated-gradient flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative">
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
            </div>

            {/* Countdown or Recording Indicator */}
            {showCountdown ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-20">
                    <div className="text-9xl font-extrabold text-white animate-ping">{countdown}</div>
                </div>
            ) : isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 text-red-500">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Recording...</span>
                </div>
            )}
            
            <p className="text-xl text-gray-700 mb-4">{currentQuestion.description}</p>
            <div className="mb-6">
                <img src={currentQuestion.imageUrl} alt="Quiz visual" className="w-full h-auto max-h-[50vh] object-contain rounded-lg bg-gray-100 shadow-md" />
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl text-2xl hover:bg-pink-600 transition-all transform hover:scale-105"
            >
              {isLastQuestion ? 'Finish' : 'Next Question'}
            </button>
        </div>
    </div>
  );
}
