
"use client";

import { createContext, useContext, useState } from 'react';

// Hardcoded initial data with proper UUIDs
const initialQuizzes = [
  { 
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
    title: 'Life Cycles of a Plant', 
    subject: 'Science', 
    questions: [{imageUrl: '/placeholder.svg', description: 'A seed is planted.'}] 
  },
  { 
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 
    title: 'The Solar System', 
    subject: 'Science', 
    questions: [] 
  },
  { 
    id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 
    title: 'World War II', 
    subject: 'History', 
    questions: [] 
  },
  { 
    id: '6ba7b812-9dad-11d1-80b4-00c04fd430c8', 
    title: 'Algebra Basics', 
    subject: 'Maths', 
    questions: [] 
  },
];

const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);

  const addQuiz = (quiz) => {
    // Generate a proper UUID for new quizzes
    const newQuiz = { ...quiz, id: crypto.randomUUID(), questions: quiz.questions || [] };
    setQuizzes(prevQuizzes => [...prevQuizzes, newQuiz]);
  };
  
  const getQuizById = (id) => {
    return quizzes.find(quiz => quiz.id === id);
  };

  return (
    <QuizContext.Provider value={{ quizzes, addQuiz, getQuizById }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  return useContext(QuizContext);
}
