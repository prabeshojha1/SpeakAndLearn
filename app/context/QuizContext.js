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
          banner_url,
          time_per_question,
          is_active,
          created_at,
          question_time_duration
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setQuizzes([]);
        return;
      }

      // Transform the data to match the expected format
      const transformedQuizzes = [];
      
      for (const quiz of data) {
        // Fetch questions for this quiz
        let questions = [];
        try {
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .select('id, image_url, question_text, correct_answer, order_index')
            .eq('quiz_id', quiz.id)
            .order('order_index', { ascending: true });

          if (questionError) {
            console.error('Error fetching questions for quiz', quiz.id, ':', questionError);
          } else {
            questions = questionData.map(question => ({
              id: question.id,
              quiz_id: quiz.id,
              imageUrl: question.image_url,
              description: question.question_text || '',
              answer: question.correct_answer || '',
              orderIndex: question.order_index
            }));
          }
        } catch (err) {
          console.error('Error loading questions for quiz', quiz.id, ':', err);
        }

        // If no questions found, use fallback
        if (questions.length === 0) {
          questions = [
            { imageUrl: '/placeholder.svg', description: 'Question 1' },
            { imageUrl: '/placeholder.svg', description: 'Question 2' },
            { imageUrl: '/placeholder.svg', description: 'Question 3' },
            { imageUrl: '/placeholder.svg', description: 'Question 4' }
          ];
        }

        transformedQuizzes.push({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || 'No description available',
          category: quiz.category,
          subject: quiz.subject,
          difficulty: quiz.difficulty || 'medium',
          coverImageUrl: quiz.banner_url || '/placeholder.svg', // Use banner_url if available
          bannerUrl: quiz.banner_url, // Also keep separate bannerUrl field
          expectedTimeSec: (quiz.time_per_question || 30) * questions.length, // Total time based on questions
          timePerQuestion: quiz.time_per_question || 30, // Time per individual question
          questions: questions
        });
      }

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
      const {title, subject, description, bannerUrl, questions, difficulty, timePerQuestion} = quiz ;
      const newQuiz = {
        title,
        category: subject,
        description,
        banner_url: bannerUrl,
        difficulty: difficulty?.toLowerCase() || 'medium',
        time_per_question: timePerQuestion || 30,
        is_active: true
      }
      const { data, error } = await supabase
        .from('quizzes')
        .insert([newQuiz])
        .select()
        .single();
      
      // Used data from created quiz to get the ID for the questions
      for (const [index, questionObj] of questions.entries()) {
        let questionInfo = {
          quiz_id: data.id,
          image_url: questionObj.imageUrl || null,
          correct_answer: questionObj.answer || '',
          question_text: questionObj.questionText || questionObj.description || '',  
          order_index: index,
          text_body: questionObj.questionText || '',
          question_type: questionObj.question_type || 'image'
        };

        let { _, error } = await supabase
        .from('questions')
        .insert([questionInfo])
        .select();

        if (error) {
          console.error('Error uploading question:', error);
          throw error;
        }
      }

      await fetchQuizzes();
      console.log('Quiz added successfully:', data);
      return data;
    } catch (err) {
      console.error('Error adding quiz:', err);
      throw err;
    }
  };
  
  const getQuizById = (id) => {
    const foundQuiz = quizzes.find(quiz => quiz.id === parseInt(id));
    return foundQuiz;
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

  const deleteQuiz = async (id) => {
  try {
    // 1. Get all questions for the quiz
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('id, image_url')
      .eq('quiz_id', id);

    if (fetchError) {
      console.error('Error fetching questions for deletion:', fetchError);
      throw fetchError;
    }

    // 2. Extract storage paths from image URLs
    console.log(`Questions to delete for quiz ${id}:`, questions);
    const pathsToDelete = questions
      .map((q) => {
        try {
          const url = new URL(q.image_url);
          const prefix = '/storage/v1/object/public/questions/'
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
        .from('questions') 
        .remove(pathsToDelete);

      if (storageError) {
        console.error('Error deleting images from storage:', storageError);

      }
    }

    // 4. Delete questions related to quiz
    const { error: questionsDeleteError } = await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', id);

    if (questionsDeleteError) {
      console.error('Error deleting questions:', questionsDeleteError);
      throw questionsDeleteError;
    }

    // 5. Delete quiz itself
    const { error: quizDeleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (quizDeleteError) {
      console.error('Error deleting quiz:', quizDeleteError);
      throw quizDeleteError;
    }

 
    await fetchQuizzes();
    console.log(`Quiz ${id} and related questions/files deleted.`);
    } catch (err) {
      console.error('Error deleting quiz:', err); 
      throw err;
    }
  }

  const getQuestionsByQuizId = async (quizId) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, image_url, question_text, correct_answer, order_index, text_body, question_type')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      return data.map(question => ({
        id: question.id,
        quiz_id: quizId,
        imageUrl: question.image_url,
        description: question.question_text || '',
        answer: question.correct_answer || '',
        orderIndex: question.order_index,
        text_body: question.text_body || '',
        question_type: question.question_type || 'image'

      }));
    } catch (err) {
      console.error('Error getting questions:', err);
      throw err;
    }
  }

  return (
    <QuizContext.Provider value={{ 
      quizzes, 
      loading,
      error,
      addQuiz, 
      getQuizById, 
      getQuizzesByDifficulty, 
      getQuizzesByCategory,
      refreshQuizzes,
      deleteQuiz,
      getQuestionsByQuizId
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