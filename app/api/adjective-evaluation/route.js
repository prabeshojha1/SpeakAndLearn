"use server";

import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(request) {
  try {
    const { imageUrl, transcript, timeSpent } = await request.json();

    if (!imageUrl || !transcript) {
      return NextResponse.json(
        { error: 'Image URL and transcript are required' },
        { status: 400 }
      );
    }

    // Create a prompt for evaluating the transcript
    const prompt = `
    You are an expert educator evaluating a student's voice response for an adjective generation challenge. 

    The student was shown an image and asked to speak as many adjectives as possible to describe it in 90 seconds.

    Student's spoken response: "${transcript}"

    Please evaluate their response and provide:
    1. A score out of 10 based on:
      - Relevance to the image (40%)
      - Creativity and variety of adjectives (30%)
      - Grammar and appropriateness (30%)
      
    2. Extract all adjectives from the transcript and categorize them as:
      - Excellent (very relevant and creative)
      - Good (relevant and appropriate)
      - Needs improvement (less relevant or incorrect)
      
    3. Suggest 3-5 additional adjectives they could have used
    4. Provide encouraging feedback
    5. Count the total number of adjectives found in their response

    Respond in JSON format with:
    {
      "score": number,
      "feedback": "string",
      "adjective_breakdown": {
        "excellent": ["adjective1", "adjective2"],
        "good": ["adjective3", "adjective4"],
        "needs_improvement": ["adjective5"]
      },
      "suggested_additions": ["adjective1", "adjective2", "adjective3"],
      "encouragement": "string",
      "total_adjectives": number
    }
    
    Note: Extract adjectives from the transcript even if they're used in sentences or phrases. Focus on descriptive words that relate to the image.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const evaluation = JSON.parse(response.choices[0].message.content);
    
    // Add some additional metadata
    evaluation.time_spent = timeSpent;
    evaluation.adjectives_per_minute = evaluation.total_adjectives && timeSpent ? 
      Math.round((evaluation.total_adjectives / (timeSpent / 60)) * 100) / 100 : 0;
    evaluation.transcript_length = transcript.length;
    evaluation.words_spoken = transcript.split(/\s+/).length;
    
    return NextResponse.json({
      success: true,
      evaluation
    });

  } catch (error) {
    console.error('Error evaluating transcript:', error);
    
    if (error.error?.type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to evaluate transcript. Please try again.' },
      { status: 500 }
    );
  }
} 