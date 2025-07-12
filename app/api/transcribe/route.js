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
      response_format: 'json',
      temperature: 0.0, // Set to 0 for most consistent results
    });

    console.log('Transcription completed for question:', questionIndex);
    console.log('Raw transcription:', transcription.text);

    // Check if the transcription is likely invalid (no actual speech)
    const transcribedText = transcription.text.trim();
    const isInvalidTranscription = (
      !transcribedText ||
      transcribedText.toLowerCase().includes('thank you for watching') ||
      transcribedText.toLowerCase().includes('please transcribe') ||
      transcribedText.toLowerCase().includes('the answer is...') ||
      transcribedText.match(/^[.\s]*$/) || // Only dots and spaces
      transcribedText.length < 3 || // Very short responses are likely noise
      transcribedText.toLowerCase() === 'you' ||
      transcribedText.toLowerCase() === 'thank you' ||
      transcribedText.toLowerCase().includes('system prompt') ||
      transcribedText.toLowerCase().includes('spoken response')
    );

    const finalTranscription = isInvalidTranscription ? '[No speech detected]' : transcribedText;
    
    console.log('Final transcription:', finalTranscription);
    console.log('Was invalid transcription detected?', isInvalidTranscription);

    return NextResponse.json({
      success: true,
      transcription: finalTranscription,
      questionIndex: parseInt(questionIndex),
      duration: transcription.duration || null,
      language: transcription.language || null,
      wasNoSpeechDetected: isInvalidTranscription
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