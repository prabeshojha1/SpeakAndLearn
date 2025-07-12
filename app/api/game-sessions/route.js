import { NextResponse } from 'next/server'
import { db } from '../../../lib/database'
import { supabase } from '../../../lib/supabase'

// Helper function to calculate combined evaluation summary
function calculateEvaluationSummary(evaluations, totalQuestions) {
  if (evaluations.length === 0) {
    return {
      overall_score: 0,
      total_questions: totalQuestions,
      evaluated_questions: 0,
      average_score: 0,
      understanding_levels: {},
      performance_category: 'no_evaluation',
      key_insights: [
        'No evaluations completed',
        'Please try recording your responses for better feedback'
      ]
    };
  }

  const scores = evaluations.map(e => e.score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  const levelCounts = evaluations.reduce((acc, evaluation) => {
    acc[evaluation.understanding_level] = (acc[evaluation.understanding_level] || 0) + 1;
    return acc;
  }, {});

  // Generate performance category
  let performanceCategory = 'needs_improvement';
  if (averageScore >= 90) performanceCategory = 'outstanding';
  else if (averageScore >= 80) performanceCategory = 'excellent';
  else if (averageScore >= 70) performanceCategory = 'good';
  else if (averageScore >= 60) performanceCategory = 'fair';

  // Generate key insights
  const keyInsights = [];
  keyInsights.push(`Completed ${evaluations.length} out of ${totalQuestions} questions`);
  keyInsights.push(`Average score: ${averageScore}%`);
  
  if (averageScore >= 90) {
    keyInsights.push('Outstanding performance! You demonstrate exceptional understanding! 🌟');
  } else if (averageScore >= 80) {
    keyInsights.push('Excellent understanding demonstrated! 🎉');
  } else if (averageScore >= 70) {
    keyInsights.push('Good grasp of the concepts! 👍');
  } else if (averageScore >= 60) {
    keyInsights.push('Fair understanding shown. Keep practicing! 💪');
  } else {
    keyInsights.push('Consider reviewing the material for better understanding 📚');
  }

  // Add level-specific insights
  if (levelCounts.excellent > 0) {
    keyInsights.push(`${levelCounts.excellent} question${levelCounts.excellent > 1 ? 's' : ''} showed excellent understanding`);
  }
  if (levelCounts.needs_improvement > 0) {
    keyInsights.push(`${levelCounts.needs_improvement} question${levelCounts.needs_improvement > 1 ? 's' : ''} need${levelCounts.needs_improvement === 1 ? 's' : ''} more practice`);
  }

  return {
    overall_score: averageScore,
    total_questions: totalQuestions,
    evaluated_questions: evaluations.length,
    average_score: averageScore,
    understanding_levels: levelCounts,
    performance_category: performanceCategory,
    key_insights: keyInsights
  };
}

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

    const { quizId, recordings, isCompleted } = await request.json()
    
    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    console.log('API Debug - User ID:', user.id);
    console.log('API Debug - Quiz ID:', quizId, typeof quizId);
    console.log('API Debug - Has recordings:', !!recordings);
    console.log('API Debug - Is completed:', isCompleted);

    // Verify that the quiz exists in the database
    const quiz = await db.getQuiz(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active session for this quiz
    let gameSession = await db.getActiveGameSession(user.id, quizId)
    
    if (isCompleted && recordings) {
      // Handle quiz completion with audio recordings
      if (!gameSession) {
        // Create a new session if one doesn't exist
        gameSession = await db.createGameSession(user.id, quizId)
      }
      
      // Process and store audio recordings
      const processedRecordings = {};
      const recordingMetadata = {};
      const evaluations = [];
      
      console.log('Processing recordings:', recordings);
      
      for (const [questionIndex, recordingData] of Object.entries(recordings)) {
        console.log(`Processing question ${questionIndex}:`, {
          hasTranscription: !!recordingData.transcription,
          hasEvaluation: !!recordingData.evaluation,
          evaluation: recordingData.evaluation
        });
        processedRecordings[questionIndex] = {
          audio_data: recordingData.base64Audio,
          mime_type: recordingData.mimeType,
          duration: recordingData.duration,
          file_size: recordingData.base64Audio ? recordingData.base64Audio.length : 0
        };
        
        recordingMetadata[questionIndex] = {
          recorded_at: new Date().toISOString(),
          question_index: parseInt(questionIndex),
          duration: recordingData.duration,
          transcription: recordingData.transcription || null,
          transcription_status: recordingData.transcription ? 'completed' : 'failed',
          evaluation: recordingData.evaluation || null,
          has_evaluation: recordingData.evaluation ? true : false
        };

        // Collect evaluations for summary
        if (recordingData.evaluation) {
          evaluations.push(recordingData.evaluation);
        }
      }

      console.log('Collected evaluations:', evaluations);
      
      // Calculate combined evaluation summary and store in evaluation_results
      const evaluationSummary = calculateEvaluationSummary(evaluations, Object.keys(recordings).length);
      
      console.log('Evaluation summary:', evaluationSummary);
      
      // Update the game session with audio recordings and evaluation summary
      const updateData = {
        is_completed: true,
        completed_at: new Date().toISOString(),
        audio_recordings: processedRecordings,
        recording_metadata: recordingMetadata,
        has_recordings: Object.keys(processedRecordings).length > 0,
        evaluation_results: evaluationSummary,
        has_evaluation: evaluations.length > 0
      };
      
      console.log('Updating game session with:', updateData);
      
      const updatedSession = await db.updateGameSession(gameSession.id, updateData);
      
      console.log('Game session completed with recordings:', updatedSession);
      return NextResponse.json(updatedSession, { status: 200 });
      
    } else {
      // Handle creating a new session or returning existing one
      if (gameSession) {
        // Return the existing session instead of creating a new one
        return NextResponse.json(gameSession)
      }

      // Create new game session using database helper
      gameSession = await db.createGameSession(user.id, quizId)

      console.log('Game session created:', gameSession)
      
      return NextResponse.json(gameSession, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating game session:', error)
    return NextResponse.json(
      { error: 'Failed to create game session', details: error.message },
      { status: 500 }
    )
  }
} 