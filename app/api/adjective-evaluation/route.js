"use server";

import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(request) {
  try {
    const { imageUrl, transcript, timeSpent, imageDescription } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Create a prompt for evaluating the transcript using the image description
    const prompt = `
    You are an expert educator evaluating a student's voice response for an adjective generation challenge. 

    The student was shown an image and asked to speak as many adjectives as possible to describe it in 90 seconds.

    Image description: "${imageDescription || 'An image for adjective generation'}"
    Student's spoken response: "${transcript}"

    Please evaluate their response and provide:
    1. A score out of 10 based on:
      - Relevance to the image described (40%)
      - Creativity and variety of adjectives (30%)
      - Grammar and appropriateness (30%)
      
    2. Extract all adjectives from the transcript and categorize them as:
      - Excellent (very relevant and creative)
      - Good (relevant and appropriate)
      - Needs improvement (less relevant or incorrect)
      
    3. Suggest 3-5 additional adjectives they could have used for this type of image
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
    
    Note: Extract adjectives from the transcript even if they're used in sentences or phrases. Focus on descriptive words that relate to the image description provided.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    let evaluation;
    try {
      // Clean the response content to remove any markdown formatting
      let content = response.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (content.startsWith('```')) {
        content = content.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      evaluation = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content:', response.choices[0].message.content);
      
      // Fallback evaluation if JSON parsing fails
      evaluation = {
        score: 5,
        feedback: "We were able to process your response, but encountered a technical issue with the detailed evaluation.",
        adjective_breakdown: {
          excellent: [],
          good: [],
          needs_improvement: []
        },
        suggested_additions: ["descriptive", "colorful", "interesting", "unique", "detailed"],
        encouragement: "Keep practicing! Describing images with adjectives helps improve your vocabulary and observation skills.",
        total_adjectives: transcript.split(/\s+/).filter(word => word.length > 2).length
      };
    }
    
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