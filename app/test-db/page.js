"use client";

import { useSupabase } from '@/app/context/SupabaseContext';
import { useEffect, useState } from 'react';

export default function TestDB() {
  const { supabase } = useSupabase();
  const [dbInfo, setDbInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test basic connection
      const { data: quizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, description')
        .limit(5);

      if (quizError) throw quizError;

      // Test game sessions
      const { data: sessions, error: sessionError } = await supabase
        .from('game_sessions')
        .select('id, quiz_id, has_recordings, evaluation_status, created_at')
        .limit(10);

      if (sessionError) throw sessionError;

      // Test auth
      const { data: { session } } = await supabase.auth.getSession();

      setDbInfo({
        quizzes: quizzes || [],
        sessions: sessions || [],
        currentUser: session?.user || null,
        connectionStatus: 'connected'
      });

    } catch (err) {
      console.error('Database test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Testing database connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Database Connection Test</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Database Error</p>
            <p>{error}</p>
          </div>
        )}

        {dbInfo && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-semibold">Connected</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current User</h2>
              {dbInfo.currentUser ? (
                <div className="space-y-2">
                  <p><strong>Email:</strong> {dbInfo.currentUser.email}</p>
                  <p><strong>ID:</strong> {dbInfo.currentUser.id}</p>
                  <p><strong>Last Sign In:</strong> {new Date(dbInfo.currentUser.last_sign_in_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-gray-500">No user logged in</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quizzes ({dbInfo.quizzes.length})</h2>
              {dbInfo.quizzes.length > 0 ? (
                <div className="space-y-2">
                  {dbInfo.quizzes.map(quiz => (
                    <div key={quiz.id} className="border-l-4 border-blue-200 pl-4">
                      <p className="font-medium">{quiz.title}</p>
                      <p className="text-sm text-gray-600">{quiz.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No quizzes found</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Sessions ({dbInfo.sessions.length})</h2>
              {dbInfo.sessions.length > 0 ? (
                <div className="space-y-2">
                  {dbInfo.sessions.map(session => (
                    <div key={session.id} className="border-l-4 border-green-200 pl-4">
                      <p className="font-medium">Session {session.id}</p>
                      <p className="text-sm text-gray-600">Quiz ID: {session.quiz_id}</p>
                      <p className="text-sm text-gray-600">
                        Has Recordings: {session.has_recordings ? '✓ Yes' : '✗ No'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Evaluation: {session.has_evaluation || 'pending'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(session.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No game sessions found</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
              <div className="flex gap-4">
                <button
                  onClick={testDatabase}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Refresh Data
                </button>
                <a
                  href="/test-evaluation"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
                >
                  Test Evaluation System
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 