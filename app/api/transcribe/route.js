import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const questionText = formData.get('questionText') || '';
    const questionIndex = formData.get('questionIndex') || '0';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Transcribing audio for question:', questionIndex);
    console.log('Audio file size:', audioFile.size, 'bytes');

    // Create a File object for OpenAI API
    const file = new File([audioFile], `question_${questionIndex}.webm`, {
      type: audioFile.type || 'audio/webm'
    });

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      prompt: `This is a voice recording answering a quiz question about: "${questionText}". Please transcribe the user's spoken response accurately.`,
      response_format: 'json',
      temperature: 0.2, // Lower temperature for more consistent results
    });

    console.log('Transcription completed for question:', questionIndex);
    console.log('Transcribed text:', transcription.text);

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      questionIndex: parseInt(questionIndex),
      duration: transcription.duration || null,
      language: transcription.language || null
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    
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
    } else if (error.status === 413) {
      return NextResponse.json(
        { error: 'Audio file too large (max 25MB)' },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 