import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(request) {
  try {
    const { transcription, quizTitle, questionIndex, suggestedAnswer, questionText, imageUrl } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'No transcription provided' },
        { status: 400 }
      );
    }

    console.log('Evaluating transcription for question:', questionIndex);
    console.log('Quiz:', quizTitle);
    console.log('Transcription:', transcription);
    console.log('Has question text:', !!questionText);
    console.log('Has image URL:', !!imageUrl);

    // Handle case where no speech was detected
    if (transcription === '[No speech detected]') {
      console.log('No speech detected - returning default evaluation');
      return NextResponse.json({
        success: true,
        evaluation: {
          score: 0,
          feedback: 'No speech was detected in your recording. Please ensure your microphone is working and try speaking louder.',
          understanding_level: 'Not Attempted'
        },
        questionIndex: parseInt(questionIndex)
      });
    }

    let prompt;
    let messages;

    // Check if we have question text or need image analysis
    if (questionText && questionText.trim()) {
      // Text-based question - compare against expected answer
      prompt = `You are an expert educational evaluator. A student answered a question about "${quizTitle}". 
      
      Question: "${questionText}"
      Student's spoken response: "${transcription}"
      Expected answer: "${suggestedAnswer}"

      Please evaluate this response and provide a JSON response with:
      - score: number from 0-100 (100 = excellent understanding)
      - feedback: brief constructive feedback (1-2 sentences)
      - understanding_level: one of "Excellent", "Good", "Fair", "Needs Improvement", or "Not Attempted"

      Focus on whether the student demonstrates understanding of the topic and provides a clear, relevant response.`;

      messages = [{ role: 'user', content: prompt }];
    } else if (imageUrl) {
      // Image-based question - use vision model to analyze image first
      prompt = `You are an expert educational evaluator. A student was shown an image and asked to describe what they see or answer a question about it.

      The student's spoken response was: "${transcription}"

      Please:
      1. Analyze what you see in the image
      2. Compare the student's response to what's actually shown
      3. Provide evaluation in JSON format with:
         - score: number from 0-100 (100 = excellent understanding/description)
         - feedback: brief constructive feedback (1-2 sentences)
         - understanding_level: one of "Excellent", "Good", "Fair", "Needs Improvement", or "Not Attempted"

      Focus on accuracy, completeness, and understanding of what's shown in the image.`;

      messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ];
    }

    // Evaluate using OpenAI (use GPT-4 Vision if we have an image)
    const completion = await openai.chat.completions.create({
      model: imageUrl && !questionText ? 'gpt-4o' : 'gpt-4o-mini', // Use vision model for image analysis
      messages: messages,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 300
    });

    const evaluation = JSON.parse(completion.choices[0].message.content);

    console.log('Evaluation completed for question:', questionIndex);
    console.log('Result:', evaluation);

    return NextResponse.json({
      success: true,
      evaluation: {
        score: evaluation.score || 0,
        feedback: evaluation.feedback || 'No feedback available',
        understanding_level: evaluation.understanding_level || 'Not Attempted'
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