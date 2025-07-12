
"use client";

import Link from 'next/link';
import { useGame } from '@/app/context/GameContext';
import { useEffect, useState } from 'react';
import { use } from 'react';

const subjectTextColors = {
  Science: 'text-green-600',
  History: 'text-red-600',
  Maths: 'text-blue-600',
  English: 'text-yellow-800',
  Geography: 'text-purple-600',
  Default: 'text-gray-600'
};

export default function ViewGamePage({ params }) {
  const { gameId } = use(params);
  const { getGameById, getQuestionsByGameId } = useGame();
  const [game, setGame] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameAndQuestions = async () => {
      const foundGame = getGameById(gameId);
      setGame(foundGame);

      if (foundGame) {
        const questions = await getQuestionsByGameId(gameId);
        setQuestions(questions);
      }
    }

    fetchGameAndQuestions();
    
  }, [gameId, getGameById, getQuestionsByGameId]);

  if (!game) {
    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center"> 
            <p className="text-xl text-blue-500">Loading game...</p> 
        </div>
    );
  }

  console.log("Game Data:", game);
  console.log("Questions Data:", questions);

  return (
    <div className="min-h-screen bg-blue-50"> 
       <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/admin/games" className="text-blue-500 hover:text-blue-700 font-bold"> 
                        &larr; Back to Games
                    </Link>
                    <h1 className={`text-2xl font-bold ${subjectTextColors[game.subject] || subjectTextColors.Default}`}>{game.title}</h1>
                </div>
            </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Images in this Game</h2>
            {questions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {questions.map((q, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            {q.question_type == 'image' ? (
                              <img src={q.imageUrl} alt={`Question ${index + 1}`} className="w-full h-40 object-cover rounded-lg bg-gray-200 mb-3" />
                            ) : (
                              <p className="text-sm text-gray-700"><span className="font-bold">Text Body:</span> {q.text_body}</p>
                            )}
                            <p className="text-sm text-gray-700"><span className="font-bold">Answer:</span> {q.answer}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No images have been added to this game yet.</p>
            )}
        </div>
      </main>
    </div>
  );
}
