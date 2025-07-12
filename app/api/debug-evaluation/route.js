import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies(); // Await for Next.js 15
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check if OpenAI API key is configured
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const apiKeyLength = process.env.OPENAI_API_KEY?.length || 0;

    // Check database connection and get sessions with recordings
    const { data: sessions, error: dbError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('has_recordings', true)
      .order('created_at', { ascending: false })
      .limit(10);

    const databaseConnected = !dbError;
    const sessionsWithRecordings = sessions || [];

    // Check if evaluation columns exist by trying to select them
    const { data: testQuery, error: columnError } = await supabase
      .from('game_sessions')
      .select('has_evaluation, evaluation_results, evaluated_at')
      .limit(1);

    const databaseColumnsExist = !columnError;

    return NextResponse.json({
      debug_info: {
        database_columns_exist: databaseColumnsExist,
        has_openai_key: hasOpenAIKey,
        api_key_length: apiKeyLength,
        total_sessions_with_recordings: sessionsWithRecordings.length,
        sessions_with_recordings: sessionsWithRecordings.map(session => ({
          id: session.id,
          has_recordings: session.has_recordings,
          recording_metadata: session.recording_metadata,
          has_evaluation: !!session.evaluation_results,
          has_evaluation: session.has_evaluation
        }))
      }
    });

  } catch (error) {
    console.error('Debug evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug information' },
      { status: 500 }
    );
  }
} 