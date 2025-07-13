
"use client";

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuiz } from '@/app/context/QuizContext';
import { useSupabase } from '@/app/context/SupabaseContext';
import { useRequireAuth } from '@/app/hooks/useAuthGuard';
import AuthGuard from '@/app/components/AuthGuard';
import StudentFooter from '@/app/components/StudentFooter';

function QuizResultsContent({ params }) {
  const { quizId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { getQuizById } = useQuiz();
  const { user, supabase } = useSupabase();
  const { isAuthenticated } = useRequireAuth();

  const [quiz, setQuiz] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const foundQuiz = getQuizById(quizId);
    setQuiz(foundQuiz);
  }, [quizId, getQuizById]);

  useEffect(() => {
    if (!user || !quiz) return;

    const fetchResults = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Please log in to view results.');
          setLoading(false);
          return;
        }

        // Get game session with recordings
        const { data: gameSessions, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('quiz_id', quizId)
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (sessionError) {
          console.error('Error fetching game session:', sessionError);
          setError('Failed to load quiz results.');
          setLoading(false);
          return;
        }

        if (!gameSessions || gameSessions.length === 0) {
          setError('No completed quiz sessions found.');
          setLoading(false);
          return;
        }

        const gameSessionData = gameSessions[0];
        setGameSession(gameSessionData);

        // Process recordings from session metadata
        if (gameSessionData.recording_metadata) {
          const recordingList = Object.entries(gameSessionData.recording_metadata).map(([index, metadata]) => ({
            questionIndex: parseInt(index),
            ...metadata,
            question: quiz.questions[parseInt(index)],
          }));
          setRecordings(recordingList);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to load quiz results.');
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, quiz, quizId, supabase]);

  if (!isAuthenticated) {
    return null; // AuthGuard will handle this
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/quizzes')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !gameSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quiz results not found.</p>
          <Link href="/quizzes" className="text-blue-500 hover:text-blue-700 font-semibold">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/quizzes" className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-block">
              &larr; Back to Quizzes
            </Link>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Quiz Results</h1>
              <h2 className="text-2xl text-gray-600 mb-2">{quiz.title}</h2>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
              <p className="text-gray-600">
                Completed on {new Date(gameSession.completed_at).toLocaleDateString()}
              </p>
            </div>

            {gameSession.evaluation_results && (
              <div className="mb-6">
                <div className="text-center mb-6">
                  <div className="inline-block px-8 py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border-2 border-purple-200 shadow-sm">
                    <span className="text-4xl font-bold text-purple-700">
                      {gameSession.evaluation_results.average_score}%
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 mt-3 font-medium">Average Score</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                    <p className="text-3xl font-bold text-blue-700 mb-2">
                      {gameSession.evaluation_results.evaluated_questions}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">Questions Evaluated</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200 shadow-sm">
                    <p className="text-3xl font-bold text-emerald-700 mb-2">
                      {gameSession.evaluation_results.total_questions}
                    </p>
                    <p className="text-sm text-emerald-600 font-medium">Total Questions</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm">
                    <p className={`text-2xl font-bold capitalize mb-2 ${
                      gameSession.evaluation_results.average_score >= 80 ? 'text-green-700' :
                      gameSession.evaluation_results.average_score >= 60 ? 'text-yellow-700' :
                      gameSession.evaluation_results.average_score >= 40 ? 'text-orange-700' :
                      'text-red-700'
                    }`}>
                      {gameSession.evaluation_results.performance_category?.replace('_', ' ') || 'N/A'}
                    </p>
                    <p className="text-sm text-purple-600 font-medium">Performance Level</p>
                  </div>
                </div>

                {gameSession.evaluation_results.overall_feedback && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm">
                    <h4 className="font-semibold text-indigo-700 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Overall Feedback
                    </h4>
                    <p className="text-indigo-800">{gameSession.evaluation_results.overall_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Individual Question Results */}
          {recordings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mr-3 border border-orange-200">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                  </svg>
                </div>
                Your Voice Recordings
              </h3>
              <div className="space-y-6">
                {recordings.map((recording, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-blue-50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <span className="w-7 h-7 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold mr-3 border border-blue-200">
                            {recording.questionIndex + 1}
                          </span>
                          Question {recording.questionIndex + 1}
                        </h4>
                        <p className="text-gray-600 ml-10">{recording.question?.description || 'Question not found'}</p>
                      </div>
                      {recording.evaluation && (
                        <div className="text-center">
                          <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                            recording.evaluation.score >= 80 ? 'bg-green-100 text-green-800 border border-green-200' :
                            recording.evaluation.score >= 60 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {recording.evaluation.score}/100
                          </div>
                        </div>
                      )}
                    </div>

                    {recording.transcription && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                        <h5 className="font-semibold text-cyan-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                          </svg>
                          Transcription:
                        </h5>
                        <p className="text-cyan-800 italic font-medium">"{recording.transcription}"</p>
                      </div>
                    )}

                    {recording.evaluation && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-purple-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                          </svg>
                          AI Evaluation:
                        </h5>
                        <p className="text-purple-800">{recording.evaluation.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/quizzes/${quizId}/play`}>
              <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold rounded-lg text-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                Take Quiz Again
              </button>
            </Link>
            <Link href="/quizzes">
              <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-lg text-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                Explore Other Quizzes
              </button>
            </Link>
          </div>
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}

export default function QuizResultsPage({ params }) {
  return (
    <AuthGuard requireAuth={true}>
      <QuizResultsContent params={params} />
    </AuthGuard>
  );
}
