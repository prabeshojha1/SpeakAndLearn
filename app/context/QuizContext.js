"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';

const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { supabase } = useSupabase();

  // Fetch quizzes from database
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching quizzes from database...');
      
      // First, let's try a simple query without the questions join
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          category,
          subject,
          difficulty,
          is_active,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No quizzes found in database');
        setQuizzes([]);
        return;
      }

      // Transform the data to match the expected format
      const transformedQuizzes = data.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || 'No description available',
        category: quiz.category,
        subject: quiz.subject,
        difficulty: quiz.difficulty || 'medium',
        coverImageUrl: '/placeholder.svg', // Default cover image
        expectedTimeSec: 300, // Default time
        questions: [ // Default questions for now since questions table is empty
          { imageUrl: '/placeholder.svg', description: 'Question 1' },
          { imageUrl: '/placeholder.svg', description: 'Question 2' },
          { imageUrl: '/placeholder.svg', description: 'Question 3' },
          { imageUrl: '/placeholder.svg', description: 'Question 4' }
        ]
      }));

      console.log('Transformed quizzes:', transformedQuizzes);

      setQuizzes(transformedQuizzes);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.message);
      
      // Fallback to hardcoded data if database fetch fails
      const fallbackQuizzes = [
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
      
      setQuizzes(fallbackQuizzes);
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes when component mounts
  useEffect(() => {
    if (supabase) {
      fetchQuizzes();
    }
  }, [supabase]);

  const addQuiz = async (quiz) => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([quiz])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh the quizzes list
      await fetchQuizzes();
      return data;
    } catch (err) {
      console.error('Error adding quiz:', err);
      throw err;
    }
  };
  
  const getQuizById = (id) => {
    return quizzes.find(quiz => quiz.id === parseInt(id));
  };

  const getQuizzesByDifficulty = (difficulty) => {
    return quizzes.filter(quiz => quiz.difficulty === difficulty);
  };

  const getQuizzesByCategory = (category) => {
    return quizzes.filter(quiz => quiz.category === category);
  };

  const refreshQuizzes = () => {
    fetchQuizzes();
  };

  return (
    <QuizContext.Provider value={{ 
      quizzes, 
      loading,
      error,
      addQuiz, 
      getQuizById, 
      getQuizzesByDifficulty, 
      getQuizzesByCategory,
      refreshQuizzes 
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
} 