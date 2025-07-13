"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRequireAuth } from '@/app/hooks/useAuthGuard';
import AuthGuard from '@/app/components/AuthGuard';
import VoiceRecorder from '@/app/components/VoiceRecorder';
import StudentFooter from '@/app/components/StudentFooter';

function AdjectiveChallengeContent() {
  const { user } = useRequireAuth();
  const router = useRouter();
  
  const [gameState, setGameState] = useState('ready'); // ready, recording, finished
  const [currentImage, setCurrentImage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Sample images - in a real app, these would come from your database
  const sampleImages = [
    { id: 1, url: '/pictures/cat-sleeps-on-windowsill-fluffy-600nw-2179489933.webp', description: 'A fluffy cat sleeping on a windowsill' },
    { id: 2, url: '/pictures/fruits-plate-green-plum-strawberry-banana-kiwi-watermelon-orange-apple_72594-822.avif', description: 'A colorful plate of various fruits' },
    { id: 3, url: '/pictures/superhero-child-jumping-against-grey-concrete-wall_411285-304.avif', description: 'A child in superhero costume jumping' },
    { id: 4, url: '/pictures/Desert with Saguaros_Rennett Stowe_large.avif', description: 'A desert landscape with saguaro cacti' },
    { id: 5, url: '/pictures/sports-car-speeding-down-a-race-track-effect-background-nature-free-photo.jpg', description: 'A sports car speeding on a race track' },
    { id: 6, url: '/pictures/student-s-backpack-overflowing-with-books-papers_964851-5514.avif', description: 'A student backpack with books and papers' },
    { id: 7, url: '/pictures/recycled-robots1.png', description: 'Colorful recycled robots' },
    { id: 8, url: '/pictures/SA-pumpkins.jpg', description: 'Orange pumpkins in a field' }
  ];

  const startGame = () => {
    // Pick a random image
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setCurrentImage(randomImage);
    setGameState('recording');
    setStartTime(Date.now());
    setTimeLeft(90);
    setTranscript('');
    setEvaluation(null);
    setError('');
    setIsRecording(true);
  };

  const handleRecordingComplete = (recordingData) => {
    setIsRecording(false);
    setTranscript(recordingData.transcription || '');
    setGameState('finished');
  };

  const handleTranscriptionStateChange = (isTranscribing) => {
    setIsTranscribing(isTranscribing);
  };

  const evaluateTranscript = async () => {
    setLoading(true);
    setError('');
    
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const response = await fetch('/api/adjective-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: currentImage.url,
          imageDescription: currentImage.description,
          transcript: transcript,
          timeSpent: timeSpent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate transcript');
      }

      const data = await response.json();
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error('Error evaluating transcript:', error);
      setError('Failed to evaluate your response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playAgain = () => {
    setGameState('ready');
    setEvaluation(null);
    setError('');
    setTranscript('');
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Adjective Challenge</h1>
            <p className="text-lg text-gray-600 mb-6">
              You'll see a random image and have <strong>90 seconds</strong> to speak as many adjectives as possible to describe it!
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">How to play:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Look at the image carefully</li>
                <li>• Speak adjectives that describe what you see</li>
                <li>• You have 90 seconds to record your response</li>
                <li>• Try to think of creative and varied descriptions</li>
                <li>• Your speech will be transcribed and evaluated</li>
              </ul>
            </div>
            {user && (
              <p className="text-sm text-gray-500 mb-4">Playing as: {user.email}</p>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-lg transition-colors transform hover:scale-105"
            >
              Start Challenge
            </button>
          </div>
        </main>
        <StudentFooter />
      </div>
    );
  }

  if (gameState === 'recording') {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Describe this image:</h3>
                <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
                  <Image
                    src={currentImage.url}
                    alt="Challenge image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Recording Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Speak your adjectives:</h3>
                <VoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  questionIndex={0}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  quizTimePerQuestion={90}
                  questionText={`Describe this image with adjectives: ${currentImage.description}`}
                  quizTitle="Adjective Challenge"
                  imageUrl={currentImage.url}
                  onTranscriptionStateChange={handleTranscriptionStateChange}
                  showFeedback={true}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Recording Complete!</h1>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Your Response:</h3>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-blue-700 italic">"{transcript || 'No transcript available'}"</p>
              </div>
            </div>

            {!evaluation && !loading && transcript && (
              <div className="text-center">
                <button
                  onClick={evaluateTranscript}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-lg transition-colors transform hover:scale-105"
                >
                  Get Evaluation
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Evaluating your response...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {evaluation && (
              <div className="space-y-6">
                {/* Score */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
                  <h3 className="text-xl font-semibold mb-2">Your Score</h3>
                  <div className="text-4xl font-bold">{evaluation.score}/10</div>
                  <p className="text-sm mt-2">
                    {evaluation.total_adjectives} adjectives found • {evaluation.adjectives_per_minute} per minute
                  </p>
                </div>

                {/* Feedback */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Feedback</h3>
                  <p className="text-gray-700">{evaluation.feedback}</p>
                </div>

                {/* Adjective Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Adjective Breakdown</h3>
                  
                  {evaluation.adjective_breakdown.excellent?.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-medium text-green-800 mb-2">Excellent</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.adjective_breakdown.excellent.map((adj, index) => (
                          <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                            {adj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.adjective_breakdown.good?.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-medium text-blue-800 mb-2">Good</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.adjective_breakdown.good.map((adj, index) => (
                          <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                            {adj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.adjective_breakdown.needs_improvement?.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <h4 className="font-medium text-yellow-800 mb-2">Could be improved</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.adjective_breakdown.needs_improvement.map((adj, index) => (
                          <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm">
                            {adj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">Suggestions</h3>
                  <p className="text-sm text-indigo-700 mb-2">You could have also used:</p>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.suggested_additions.map((adj, index) => (
                      <span key={index} className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded text-sm">
                        {adj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Encouragement */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Encouragement</h3>
                  <p className="text-blue-700">{evaluation.encouragement}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={playAgain}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={() => router.push('/player/games')}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                Back to Games
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default function AdjectiveChallengePage() {
  return (
    <AuthGuard requireAuth={true}>
      <AdjectiveChallengeContent />
    </AuthGuard>
  );
} 