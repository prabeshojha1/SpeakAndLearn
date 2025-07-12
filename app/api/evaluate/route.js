import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(request) {
  try {
    const { transcription, quizTitle, questionIndex } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'No transcription provided' },
        { status: 400 }
      );
    }

    console.log('Evaluating transcription for question:', questionIndex);
    console.log('Quiz:', quizTitle);
    console.log('Transcription:', transcription);

    // Simple evaluation prompt
    const prompt = `You are an expert educational evaluator. A student answered a question about "${quizTitle}" and their response was: "${transcription}"

        Please evaluate this response and provide a JSON response with:
        - score: number from 0-100 (100 = excellent understanding)
        - feedback: brief constructive feedback (1-2 sentences)
        - understanding_level: one of "excellent", "good", "fair", "needs_improvement", or "not_attempted"

        Focus on whether the student demonstrates understanding of the topic and provides a clear, relevant response.`;

    // Evaluate using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 200
    });

    const evaluation = JSON.parse(completion.choices[0].message.content);

    console.log('Evaluation completed for question:', questionIndex);
    console.log('Result:', evaluation);

    return NextResponse.json({
      success: true,
      evaluation: {
        score: evaluation.score || 0,
        feedback: evaluation.feedback || 'No feedback available',
        understanding_level: evaluation.understanding_level || 'not_attempted'
      },
      questionIndex: parseInt(questionIndex)
    });

  } catch (error) {
    console.error('Error evaluating response:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    } else if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to evaluate response', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 