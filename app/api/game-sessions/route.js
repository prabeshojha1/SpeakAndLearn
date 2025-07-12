import { NextResponse } from 'next/server'
import { db } from '../../../lib/database'
import { supabase } from '../../../lib/supabase'

// POST /api/game-sessions - Create a new game session when "Let's go" is clicked
export async function POST(request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { quizId } = await request.json()
    
    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    console.log('API Debug - User ID:', user.id);
    console.log('API Debug - Quiz ID:', quizId, typeof quizId);

    // Verify that the quiz exists in the database
    const quiz = await db.getQuiz(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active session for this quiz
    const activeSession = await db.getActiveGameSession(user.id, quizId)
    if (activeSession) {
      // Return the existing session instead of creating a new one
      return NextResponse.json(activeSession)
    }

    // Create new game session using database helper
    const gameSession = await db.createGameSession(user.id, quizId)

    console.log('Game session created:', gameSession)
    
    return NextResponse.json(gameSession, { status: 201 })
  } catch (error) {
    console.error('Error creating game session:', error)
    return NextResponse.json(
      { error: 'Failed to create game session', details: error.message },
      { status: 500 }
    )
  }
} 