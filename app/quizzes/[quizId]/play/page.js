
"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/app/context/QuizContext';
import { useSupabase } from '@/app/context/SupabaseContext';
import VoiceRecorder from '@/app/components/VoiceRecorder';

export default function QuizPlayPage({ params }) {
  const { quizId } = use(params);
  const router = useRouter();
  const { getQuizById } = useQuiz();
  const { user, supabase } = useSupabase();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [recordings, setRecordings] = useState({}); // Store recordings by question index
  const [gameSessionId, setGameSessionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

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
  };

  const handleRecordingComplete = (recordingData) => {
    // Store the recording data including evaluation
    setRecordings(prev => ({
      ...prev,
      [currentQuestionIndex]: recordingData
    }));
    
  };

  const handleTranscriptionStateChange = (isTranscribingNow) => {
    setIsTranscribing(isTranscribingNow);
  };

  const handleNext = () => {
    setIsRecording(false);
    setCountdown(3);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Create or update game session with audio recordings
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to save your recordings.');
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/game-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          quizId: quizId,
          recordings: recordings,
          isCompleted: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save recordings');
      }

      const gameSession = await response.json();
      console.log('Game session saved with recordings:', gameSession);
      
      // Navigate to results page with session ID for better data retrieval
      router.push(`/quizzes/${quizId}/results?sessionId=${gameSession.id}`);
    } catch (error) {
      console.error('Error saving recordings:', error);
      alert('Failed to save recordings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!quiz) {
    return <div className="min-h-screen animated-gradient flex items-center justify-center"><p>Loading Quiz...</p></div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative border border-blue-200">
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
            </div>

            {/* Countdown */}
            {showCountdown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl z-20">
                    <div className="text-8xl font-bold text-white drop-shadow-lg">{countdown}</div>
                </div>
            )}
            
            {/* Question Content */}
            <div className="mb-6">
              {currentQuestion.imageUrl ? (
                <>
                  <p className="text-xl text-gray-700 mb-4">{currentQuestion.description}</p>
                  <div className="mb-6">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Quiz visual" 
                      className="w-full h-auto max-h-[50vh] object-contain rounded-lg bg-blue-50 shadow-md border border-blue-200"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-200">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Question {currentQuestionIndex + 1}</h2>
                  <p className="text-xl text-gray-700 leading-relaxed">{currentQuestion.description}</p>
                </div>
              )}
            </div>

            {/* Voice Recorder Component */}
            <div className="mb-6">
                <VoiceRecorder 
                  key={currentQuestionIndex}
                  onRecordingComplete={handleRecordingComplete}
                  questionIndex={currentQuestionIndex}
                  questionText={currentQuestion.description}
                  quizTitle={quiz.title}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  onTranscriptionStateChange={handleTranscriptionStateChange}
                  showFeedback={false}
                />
            </div>

            <button 
              onClick={handleNext}
              disabled={isRecording || isSubmitting}
              className={`w-full font-bold py-4 rounded-xl text-2xl transition-all transform hover:scale-105 ${
                isRecording || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
              }`}
            >
              {isSubmitting ? 'Saving...' : 
               isRecording ? 'Recording...' : 
               isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </button>
        </div>
    </div>
  );
}
