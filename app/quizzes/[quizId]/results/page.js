
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/quizzes" className="text-blue-500 hover:text-blue-700 font-semibold mb-4 inline-block">
              &larr; Back to Quizzes
            </Link>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Quiz Results</h1>
              <h2 className="text-2xl text-gray-600 mb-2">{quiz.title}</h2>

            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
              <p className="text-gray-600">
                Completed on {new Date(gameSession.completed_at).toLocaleDateString()}
              </p>
            </div>

            {gameSession.evaluation_results && (
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="inline-block px-6 py-3 bg-blue-100 rounded-full">
                    <span className="text-3xl font-bold text-blue-600">
                      {gameSession.evaluation_results.average_score}%
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 mt-2">Average Score</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {gameSession.evaluation_results.evaluated_questions}
                    </p>
                    <p className="text-sm text-gray-600">Questions Evaluated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {gameSession.evaluation_results.total_questions}
                    </p>
                    <p className="text-sm text-gray-600">Total Questions</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold capitalize ${
                      gameSession.evaluation_results.average_score >= 80 ? 'text-green-600' :
                      gameSession.evaluation_results.average_score >= 60 ? 'text-yellow-600' :
                      gameSession.evaluation_results.average_score >= 40 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {gameSession.evaluation_results.performance_category?.replace('_', ' ') || 'N/A'}
                    </p>
                    <p className={`text-sm ${
                      gameSession.evaluation_results.average_score >= 80 ? 'text-green-500' :
                      gameSession.evaluation_results.average_score >= 60 ? 'text-yellow-500' :
                      gameSession.evaluation_results.average_score >= 40 ? 'text-orange-500' :
                      'text-red-500'
                    }`}>Performance Level</p>
                  </div>
                </div>

                {gameSession.evaluation_results.overall_feedback && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Overall Feedback</h4>
                    <p className="text-gray-700">{gameSession.evaluation_results.overall_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Individual Question Results */}
          {recordings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Voice Recordings</h3>
              <div className="space-y-6">
                {recordings.map((recording, index) => (
                  <div key={index} className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Question {recording.questionIndex + 1}
                        </h4>
                        <p className="text-gray-600">{recording.question?.description || 'Question not found'}</p>
                      </div>
                      {recording.evaluation && (
                        <div className="text-center">
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            recording.evaluation.score >= 80 ? 'bg-green-100 text-green-800' :
                            recording.evaluation.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {recording.evaluation.score}/100
                          </div>
                        </div>
                      )}
                    </div>

                    {recording.transcription && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Transcription:</h5>
                        <p className="text-gray-600 italic">"{recording.transcription}"</p>
                      </div>
                    )}

                    {recording.evaluation && (
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">AI Evaluation:</h5>
                        <p className="text-gray-600">{recording.evaluation.feedback}</p>
                      </div>
                    )}

                    {/* <div className="mt-4 text-sm text-gray-500">
                      <p>Recorded: {new Date(recording.recorded_at).toLocaleString()}</p>
                    </div> */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/quizzes/${quizId}/play`}>
              <button className="w-full sm:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-lg transition-colors">
                Take Quiz Again
              </button>
            </Link>
            <Link href="/quizzes">
              <button className="w-full sm:w-auto px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg text-lg transition-colors">
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
