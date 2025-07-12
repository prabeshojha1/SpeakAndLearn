# OpenAI Whisper Integration Setup

## Overview
This project uses OpenAI's Whisper API to automatically transcribe voice recordings from quiz questions. The transcriptions are stored in the database alongside the audio recordings.

## Required Environment Variables

Add the following to your `.env.local` file:

```bash
# OpenAI Configuration (for voice transcription and evaluation)
OPEN_AI_KEY=your_openai_api_key_here
```

## Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to the API section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## Usage & Costs

### Transcription (Whisper-1)
- **Cost**: $0.006 per minute of audio
- **File Limits**: Max 25MB per file
- **Supported Formats**: WebM (used by the app)

### Evaluation (GPT-4o-mini)
- **Cost**: ~$0.0015 per 1K tokens (varies by response length)
- **Usage**: Analyzes transcribed text for understanding assessment
- **Typical Cost**: ~$0.01-0.03 per 4-question quiz evaluation

### Total Cost Estimate
- **Per Quiz**: ~$0.008 (transcription) + ~$0.02 (evaluation) = ~$0.028 per quiz
- **Monthly**: 100 quizzes ≈ $2.80

## Features

✅ **Automatic Transcription**: Each 20-second voice recording is automatically transcribed
✅ **Smart Prompts**: Uses question context to improve transcription accuracy  
✅ **Error Handling**: Gracefully handles API failures
✅ **Storage**: Transcriptions stored in `game_sessions.recording_metadata`
✅ **UI Integration**: Shows transcription status and results

## API Endpoint

The transcription happens via `/api/transcribe` which:
- Accepts audio files via FormData
- Sends to OpenAI Whisper API
- Returns transcribed text
- Handles errors gracefully

## Database Schema

Transcriptions are stored in the `recording_metadata` JSONB column:

```json
{
  "0": {
    "recorded_at": "2024-01-15T10:30:00Z",
    "question_index": 0,
    "duration": 18.5,
    "transcription": "The seed needs water and sunlight to grow...",
    "transcription_status": "completed"
  }
}
```

## Troubleshooting

### "OpenAI API key not configured"
- Ensure `OPEN_AI_KEY` is in your `.env.local` file
- Restart your development server after adding the key

### "Invalid OpenAI API key"  
- Check that your API key is correct
- Verify your OpenAI account has API access

### "OpenAI API quota exceeded"
- Check your OpenAI usage dashboard
- Add billing information to your OpenAI account

### "Audio file too large"
- Current limit is 25MB (should not be an issue with 20-second recordings)
- Check if audio encoding is working properly

## Testing

1. Complete the database setup (run `add-audio-columns.sql` and `add-evaluation-columns.sql`)
2. Add your OpenAI API key to `.env.local`
3. Start the development server
4. Take a quiz and speak clearly during recording
5. Check the results page for transcriptions
6. Click "Analyze My Understanding" to get AI evaluation
7. Review the detailed feedback and scores 