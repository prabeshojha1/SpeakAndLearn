"use client";

import { useSupabase } from '@/app/context/SupabaseContext';
import { useEffect, useState } from 'react';

export default function TestEvaluation() {
  const { supabase } = useSupabase();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load debug info
      const debugResponse = await fetch('/api/debug-evaluation');
      const debugData = await debugResponse.json();
      setDebugInfo(debugData);

      // Load sessions
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*, quizzes(*)')
        .eq('has_recordings', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const evaluateSession = async (sessionId) => {
    try {
      setEvaluating(prev => ({ ...prev, [sessionId]: true }));
      
      const session = sessions.find(s => s.id === sessionId);
      if (!session || !session.recording_metadata) {
        throw new Error('Session not found or no recordings available');
      }

      const evaluationResults = {};
      let totalScore = 0;
      let evaluationCount = 0;

      // Process each recording in the session
      for (const [questionIndex, recording] of Object.entries(session.recording_metadata)) {
        if (recording.transcription) {
          try {
            const response = await fetch('/api/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transcription: recording.transcription,
                quizTitle: session.quizzes?.title || 'Unknown Quiz',
                questionIndex: parseInt(questionIndex)
              })
            });

            if (!response.ok) {
              throw new Error(`Failed to evaluate question ${questionIndex}`);
            }

            const evaluation = await response.json();
            evaluationResults[questionIndex] = evaluation;
            totalScore += evaluation.score;
            evaluationCount++;
          } catch (error) {
            console.error(`Error evaluating question ${questionIndex}:`, error);
            evaluationResults[questionIndex] = {
              score: 0,
              feedback: 'Evaluation failed',
              understanding_level: 'needs_improvement'
            };
          }
        }
      }

      const overallScore = evaluationCount > 0 ? Math.round(totalScore / evaluationCount) : 0;
      const finalResults = {
        overall_score: overallScore,
        question_evaluations: evaluationResults
      };

      // Update the session with evaluation results
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          evaluation_results: finalResults,
          has_evaluation: true
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
      }

      console.log('Evaluation completed:', finalResults);
      
      // Reload data to show updated evaluation
      await loadData();
    } catch (error) {
      console.error('Error evaluating session:', error);
      alert(error.message);
    } finally {
      setEvaluating(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading evaluation system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Evaluation System Debug</h1>
        
        {debugInfo && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Database Connection:</p>
                <p className={`font-semibold ${debugInfo.debug_info?.database_columns_exist ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.debug_info?.database_columns_exist ? '✓ Connected' : '✗ Failed'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">OpenAI API Key:</p>
                <p className={`font-semibold ${debugInfo.debug_info?.has_openai_key ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.debug_info?.has_openai_key ? `✓ Configured (${debugInfo.debug_info.api_key_length} chars)` : '✗ Missing'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Sessions with Recordings:</p>
                <p className={`font-semibold ${debugInfo.debug_info?.total_sessions_with_recordings > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {debugInfo.debug_info?.total_sessions_with_recordings || 0} found
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Session Evaluation Testing</h2>
          
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sessions with recordings found</p>
          ) : (
            <div className="space-y-6">
              {sessions.map(session => (
                <div key={session.id} className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Session {session.id}</h3>
                      <p className="text-gray-600">Quiz: {session.quizzes?.title || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(session.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => evaluateSession(session.id)}
                      disabled={evaluating[session.id]}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {evaluating[session.id] ? 'Evaluating...' : (session.has_evaluation ? 'Re-evaluate' : 'Evaluate')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <span className="font-medium">Status:</span>
                      <span className={`${getStatusColor(session.has_evaluation)}`}>
                        {session.has_evaluation ? 'completed' : 'pending'}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <span className="font-medium">Has Recordings:</span>
                      <span className={`${session.has_recordings ? 'text-green-600' : 'text-red-600'}`}>
                        {session.has_recordings ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>

                    {session.evaluation_results && (
                      <div className="mt-4 p-4 bg-white rounded border">
                        <h4 className="font-semibold mb-2">Evaluation Results:</h4>
                        <div className="space-y-2">
                          <p className="font-medium">Overall Score: {session.evaluation_results.overall_score}/100</p>
                          {session.evaluation_results.question_evaluations && (
                            <div className="space-y-2">
                              {Object.entries(session.evaluation_results.question_evaluations).map(([qIndex, evaluation]) => (
                                <div key={qIndex} className="border-l-4 border-blue-200 pl-4">
                                  <p className="font-medium">Question {parseInt(qIndex) + 1}</p>
                                  <p className="text-sm">Score: {evaluation.score}/100</p>
                                  <p className="text-sm text-gray-600">{evaluation.feedback}</p>
                                  <p className="text-sm">
                                    Level: <span className={getLevelColor(evaluation.understanding_level)}>
                                      {evaluation.understanding_level}
                                    </span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {session.recording_metadata && (
                      <div className="mt-4">
                        <details className="cursor-pointer">
                          <summary className="font-medium text-gray-700 hover:text-gray-900">
                            Recording Metadata ({Object.keys(session.recording_metadata).length} recordings)
                          </summary>
                          <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(session.recording_metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(hasEvaluation) {
  if (hasEvaluation === true) {
    return 'text-green-600';
  } else {
    return 'text-gray-600';
  }
}

function getLevelColor(level) {
  switch (level) {
    case 'excellent':
      return 'text-green-600';
    case 'good':
      return 'text-blue-600';
    case 'fair':
      return 'text-yellow-600';
    case 'needs_improvement':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
} 