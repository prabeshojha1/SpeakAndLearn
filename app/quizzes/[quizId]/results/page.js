
"use client";

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuiz } from '@/app/context/QuizContext';
import { useSupabase } from '@/app/context/SupabaseContext';

export default function QuizResultsPage({ params }) {
  const { quizId } = use(params);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { getQuizById } = useQuiz();
  const { supabase } = useSupabase();
  
  const [quiz, setQuiz] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New: color mapping for performance categories
  const performanceColors = {
    outstanding: 'bg-green-100 text-green-700',
    excellent: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-yellow-100 text-yellow-700',
    needs_improvement: 'bg-red-100 text-red-700',
    no_evaluation: 'bg-gray-100 text-gray-700',
  };

  // Fetch quiz data and game session
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get quiz data
        const foundQuiz = getQuizById(quizId);
        setQuiz(foundQuiz);
        
        // Get user's game session for this quiz
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          let gameSessionQuery = supabase
            .from('game_sessions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('quiz_id', parseInt(quizId))
            .eq('is_completed', true);
          
          // If we have a specific session ID, fetch that one
          if (sessionId) {
            gameSessionQuery = gameSessionQuery.eq('id', parseInt(sessionId));
          } else {
            // Otherwise get the latest completed session
            gameSessionQuery = gameSessionQuery
              .order('completed_at', { ascending: false })
              .limit(1);
          }
          
          const { data: gameSessions, error } = await gameSessionQuery;
          
          if (error) {
            console.error('Error fetching game session:', error);
            setError('Failed to load quiz results');
                  } else if (gameSessions && gameSessions.length > 0) {
          console.log('Debug: Found game session:', gameSessions[0]);
          console.log('Debug: has_recordings:', gameSessions[0].has_recordings);
          console.log('Debug: recording_metadata:', gameSessions[0].recording_metadata);
          console.log('Debug: audio_recordings keys:', gameSessions[0].audio_recordings ? Object.keys(gameSessions[0].audio_recordings) : 'none');
          console.log('Debug: has_evaluation:', gameSessions[0].has_evaluation);
          setGameSession(gameSessions[0]);
        } else if (sessionId) {
            // If specific session not found, try getting the latest one
            const { data: fallbackSessions, error: fallbackError } = await supabase
              .from('game_sessions')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('quiz_id', parseInt(quizId))
              .eq('is_completed', true)
              .order('completed_at', { ascending: false })
              .limit(1);
            
            if (!fallbackError && fallbackSessions && fallbackSessions.length > 0) {
              setGameSession(fallbackSessions[0]);
            }
          }
        }
        
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };
    
    if (quizId && supabase) {
      fetchData();
    }
  }, [quizId, supabase, getQuizById]);

  // Create audio URL from base64 data
  const createAudioURL = (base64Audio, mimeType = 'audio/webm') => {
    if (!base64Audio) return null;
    
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating audio URL:', error);
      return null;
    }
  };

  // Cleanup audio URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any blob URLs that were created
      if (gameSession?.audio_recordings) {
        Object.values(gameSession.audio_recordings).forEach(audioData => {
          if (audioData?.audio_data) {
            const url = createAudioURL(audioData.audio_data, audioData.mime_type);
            if (url) {
              URL.revokeObjectURL(url);
            }
          }
        });
      }
    };
  }, [gameSession]);



  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <Link href="/quizzes">
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
              Back to Quizzes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Quiz not found</p>
          <Link href="/quizzes">
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
              Back to Quizzes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-blue-500 text-white p-4 text-center">
        <h1 className="text-3xl font-bold">Quiz Results</h1>
      </header>
      <main className="p-8">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-6">
            {/* Placeholder image box */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl flex items-center justify-center">
                <div className="text-3xl">
                  <img src={quiz.bannerUrl} alt="Quiz Results" className="w-24 h-24" />
                </div>
              </div>
            </div>
            
            {/* Quiz title and completion text */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">{quiz.title}</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-green-600">Quiz Completed!</span>
              </div>
              <p className="text-sm text-gray-600">
                {gameSession ? 
                  `Completed on ${new Date(gameSession.completed_at).toLocaleDateString()}` :
                  'Your quiz responses have been recorded successfully!'
                }
              </p>
              {gameSession?.has_recordings && (
                <p className="text-sm text-blue-600 mt-1">
                  {Object.keys(gameSession.audio_recordings || {}).length} voice recordings saved
                </p>
              )}
            </div>
          </div>

          {/* Overall AI Performance Summary */}
          {gameSession?.has_evaluation && gameSession.evaluation_results && (
            <div className="mb-10 p-6 rounded-xl border border-purple-200 bg-purple-50 shadow-sm">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Overall AI Performance Summary</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-extrabold text-purple-600">
                    {gameSession.evaluation_results.overall_score}<span className="text-3xl">%</span>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">Average Score</p>
                    <p className="text-sm text-gray-500">
                      {gameSession.evaluation_results.evaluated_questions} / {gameSession.evaluation_results.total_questions} questions evaluated
                    </p>
                  </div>
                </div>

                {/* Performance category chip */}
                <span
                  className={`self-start sm:self-auto text-xs px-3 py-1 rounded-full font-medium ${
                    performanceColors[gameSession.evaluation_results.performance_category] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {gameSession.evaluation_results.performance_category.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Combined feedback */}
              {gameSession.evaluation_results.overall_feedback && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {gameSession.evaluation_results.overall_feedback}
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800">Your Voice Recordings</h3>
            
            {quiz.questions.map((question, index) => {
              const audioData = gameSession?.audio_recordings?.[index];
              const audioURL = audioData ? createAudioURL(audioData.audio_data, audioData.mime_type) : null;
              const metadata = gameSession?.recording_metadata?.[index];
              
              // Debug logging for troubleshooting
              console.log(`Question ${index + 1} debug info:`, {
                hasAudioData: !!audioData,
                hasAudioURL: !!audioURL,
                hasMetadata: !!metadata,
                audioDataKeys: audioData ? Object.keys(audioData) : 'none',
                metadataKeys: metadata ? Object.keys(metadata) : 'none'
              });
              
              return (
                <div key={index} className="border border-gray-200 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    {question.imageUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={question.imageUrl} 
                          alt={`Question ${index + 1}`} 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-gray-600 mb-3">{question.description}</p>
                      
                      {audioURL ? (
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-600">
                              Recording Available
                            </span>
                            {metadata?.duration && (
                              <span className="text-xs text-gray-500">
                                Duration: {Math.round(metadata.duration)}s
                              </span>
                            )}
                          </div>
                          <audio 
                            controls 
                            src={audioURL} 
                            className="w-full mb-3"
                            preload="metadata"
                          >
                            Your browser does not support the audio element.
                          </audio>
                          
                          {/* Transcription Section */}
                          {metadata?.transcription && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-700">Transcription:</span>
                                {/* {metadata.transcription_status === 'completed' && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    AI Processed
                                  </span>
                                )} */}
                              </div>
                              <p className="text-gray-700 text-sm italic leading-relaxed">
                                "{metadata.transcription}"
                              </p>
                            </div>
                          )}

                          {/* Evaluation Section */}
                          {metadata?.evaluation ? (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-purple-700">AI Evaluation:</span>
                                  {/* {metadata.has_evaluation && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                      Analysed
                                    </span>
                                  )} */}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  metadata.evaluation.understanding_level === 'excellent' ? 'bg-green-100 text-green-700' :
                                  metadata.evaluation.understanding_level === 'good' ? 'bg-blue-100 text-blue-700' :
                                  metadata.evaluation.understanding_level === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {metadata.evaluation.understanding_level}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className="font-bold text-lg text-purple-700">{metadata.evaluation.score}/100</span>
                              </div>
                              <p className="text-gray-700 text-sm">{metadata.evaluation.feedback}</p>
                            </div>
                          ) : metadata?.transcription ? (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-yellow-700">AI Evaluation:</span>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                  Processing
                                </span>
                              </div>
                              <p className="text-sm text-yellow-600 mt-1">
                                Evaluation is being processed. Please refresh the page in a moment.
                              </p>
                            </div>
                          ) : null}
                          
                          {metadata?.transcription_status === 'failed' && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="text-sm text-yellow-700">
                                Transcription could not be completed for this recording
                              </p>
                            </div>
                          )}
                          
                          {metadata?.recorded_at && (
                            <p className="text-xs text-gray-400 mt-2">
                              Recorded: {new Date(metadata.recorded_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">No recording available for this question</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {(!gameSession || !gameSession.has_recordings) && (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 font-medium">No audio recordings found</p>
                <p className="text-yellow-600 text-sm">
                  This might be an older quiz session completed before audio recording was enabled.
                </p>
              </div>
            )}
          </div>




          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/quizzes/${quizId}`}>
                <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors">
                  Take Quiz Again
                </button>
              </Link>
              <Link href="/quizzes">
                <button className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-600 transition-colors">
                  Explore Other Quizzes
                </button>
              </Link>
            </div>
            
            {gameSession && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Session Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Started:</span> {new Date(gameSession.started_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Completed:</span> {new Date(gameSession.completed_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Total Questions:</span> {quiz.questions.length}
                  </div>
                  <div>
                    <span className="font-medium">Recordings:</span> {Object.keys(gameSession.audio_recordings || {}).length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
