"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { supabase } = useSupabase();

  // Fetch games from database
  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching games from database...');
      
      // First, let's try a simple query without the questions join
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          title,
          description,
          category,
          subject,
          difficulty,
          is_active,
          created_at,
          question_time_duration
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No games found in database');
        setGames([]);
        return;
      }

      // Transform the data to match the expected format
      const transformedGames = data.map(game => ({
        id: game.id,
        title: game.title,
        description: game.description || 'No description available',
        category: game.category,
        subject: game.subject,
        difficulty: game.difficulty || 'medium',
        coverImageUrl: '/placeholder.svg', // Default cover image
        expectedTimeSec: 300, // Default time
        questions: [ // Default questions for now since questions table is empty
          { imageUrl: '/placeholder.svg', description: 'Question 1' },
          { imageUrl: '/placeholder.svg', description: 'Question 2' },
          { imageUrl: '/placeholder.svg', description: 'Question 3' },
          { imageUrl: '/placeholder.svg', description: 'Question 4' }
        ]
      }));

      console.log('Transformed games:', transformedGames);

      setGames(transformedGames);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err.message);
      
      // Fallback to hardcoded data if database fetch fails
      const fallbackGames = [
        { 
          id: 1, 
          title: 'Life Cycles of a Plant', 
          subject: 'Science',
          description: 'Learn about how plants grow and develop through their life cycle.',
          category: 'Science',
          difficulty: 'easy',
          expectedTimeSec: 180,
          coverImageUrl: '/placeholder.svg',
          questions: [
            { imageUrl: '/placeholder.svg', description: 'A seed is planted.' },
            { imageUrl: '/placeholder.svg', description: 'The seed germinates.' },
            { imageUrl: '/placeholder.svg', description: 'The plant grows.' },
            { imageUrl: '/placeholder.svg', description: 'The plant flowers.' }
          ]
        },
        { 
          id: 2, 
          title: 'The Solar System', 
          subject: 'Science',
          description: 'Explore the planets and celestial bodies in our solar system.',
          category: 'Science',
          difficulty: 'medium',
          expectedTimeSec: 300,
          coverImageUrl: '/placeholder.svg',
          questions: [
            { imageUrl: '/placeholder.svg', description: 'The Sun is the center of our solar system.' },
            { imageUrl: '/placeholder.svg', description: 'Mercury is the closest planet to the Sun.' },
            { imageUrl: '/placeholder.svg', description: 'Venus is the hottest planet.' },
            { imageUrl: '/placeholder.svg', description: 'Earth is the third planet from the Sun.' }
          ]
        },
        { 
          id: 3, 
          title: 'World War II', 
          subject: 'History',
          description: 'Learn about the major events and figures of World War II.',
          category: 'History',
          difficulty: 'hard',
          expectedTimeSec: 420,
          coverImageUrl: '/placeholder.svg',
          questions: [
            { imageUrl: '/placeholder.svg', description: 'World War II began in 1939.' },
            { imageUrl: '/placeholder.svg', description: 'The Battle of Britain took place in 1940.' },
            { imageUrl: '/placeholder.svg', description: 'Pearl Harbor was attacked in 1941.' },
            { imageUrl: '/placeholder.svg', description: 'D-Day landings occurred in 1944.' }
          ]
        },
        { 
          id: 4, 
          title: 'Algebra Basics', 
          subject: 'Maths',
          description: 'Master the fundamentals of algebraic expressions and equations.',
          category: 'Mathematics',
          difficulty: 'medium',
          expectedTimeSec: 360,
          coverImageUrl: '/placeholder.svg',
          questions: [
            { imageUrl: '/placeholder.svg', description: 'Variables represent unknown values.' },
            { imageUrl: '/placeholder.svg', description: 'Equations can be solved for variables.' },
            { imageUrl: '/placeholder.svg', description: 'Addition and subtraction are inverse operations.' },
            { imageUrl: '/placeholder.svg', description: 'Multiplication and division are inverse operations.' }
          ]
        }
      ];
      
      setGames(fallbackGames);
    } finally {
      setLoading(false);
    }
  };

  // Fetch games when component mounts
  useEffect(() => {
    if (supabase) {
      fetchGames();
    }
  }, [supabase]);

  const addGame = async (game) => {
    try {
      const {title, subject, description, question_time_duration, questions} = game ;
      const newGame = {
        title,
        category: subject,
        description,
        is_active: true,
        question_time_duration
      }
      const { data, error } = await supabase
        .from('games')
        .insert([newGame])
        .select()
        .single();
      
      // Used data from created game to get the ID for the questions
      console.log('Game created:', data);
      console.log('Questions to upload:', questions);
      for (const fileObj of questions) {
        let questionInfo = {
          game_id: data.id,
          image_url: fileObj.imageUrl,
          correct_answer: fileObj.answer || '',
          question_text: description || '',
          text_body: fileObj.questionText || ''  
        };

        let { _, error } = await supabase
        .from('game_questions')
        .insert([questionInfo])
        .select();

        if (error) {
          console.error('Error uploading question:', error);
          throw error;
        }
      }

      await fetchGames();
      console.log('Game added successfully:', data);
      return data;
    } catch (err) {
      console.error('Error adding game:', err);
      throw err;
    }
  };
  
  const getGameById = (id) => {
    return games.find(game => game.id === parseInt(id));
  };

  const getGamesByDifficulty = (difficulty) => {
    return games.filter(game => game.difficulty === difficulty);
  };

  const getGamesByCategory = (category) => {
    return games.filter(game => game.category === category);
  };

  const refreshGames = () => {
    fetchGames();
  };

  const deleteGame = async (id) => {
  try {
    // 1. Get all questions for the game
    const { data: questions, error: fetchError } = await supabase
      .from('game_questions')
      .select('id, image_url')
      .eq('game_id', id);

    if (fetchError) {
      console.error('Error fetching questions for deletion:', fetchError);
      throw fetchError;
    }

    // 2. Extract storage paths from image URLs
    console.log(`Questions to delete for game ${id}:`, questions);
    const pathsToDelete = questions
      .map((q) => {
        try {
          const url = new URL(q.image_url);
          const prefix = '/storage/v1/object/public/game-questions/'
          const pathStartIndex = url.pathname.indexOf(prefix);
          const path = url.pathname.slice(pathStartIndex + prefix.length);
          console.log(`Path to delete: ${path}`);
          return path
        } catch (err) {
          console.warn('Invalid image URL:', q.image_url);
          return null;
        }
      })
      .filter(Boolean);

    // 3. Delete the files from Supabase Storage

    console.log('Paths:', pathsToDelete);
    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase
        .storage
        .from('game-questions')
        .remove(pathsToDelete);

      if (storageError) {
        console.error('Error deleting images from storage:', storageError);

      }
    }

    // 4. Delete questions related to game
    const { error: questionsDeleteError } = await supabase
      .from('game_questions')
      .delete()
      .eq('game_id', id);

    if (questionsDeleteError) {
      console.error('Error deleting questions:', questionsDeleteError);
      throw questionsDeleteError;
    }

    // 5. Delete game itself
    const { error: gameDeleteError } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (gameDeleteError) {
      console.error('Error deleting game:', gameDeleteError);
      throw gameDeleteError;
    }

 
    await fetchGames();
    console.log(`Game ${id} and related questions/files deleted.`);
    } catch (err) {
      console.error('Error deleting game:', err); 
      throw err;
    }
  }

  const getQuestionsByGameId = async (gameId) => {
    try {
      const { data, error } = await supabase
        .from('game_questions')
        .select('id, image_url, question_text, correct_answer')
        .eq('game_id', gameId);

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      return data.map(question => ({
        id: question.id,
        game_id: gameId,
        imageUrl: question.image_url,
        description: question.question_text || '',
        answer: question.correct_answer || ''
      }));
    } catch (err) {
      console.error('Error getting questions:', err);
      throw err;
    }
  }

  return (
    <GameContext.Provider value={{ 
      games, 
      loading,
      error,
      addGame, 
      getGameById, 
      getGamesByDifficulty, 
      getGamesByCategory,
      refreshGames,
      deleteGame,
      getQuestionsByGameId
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 