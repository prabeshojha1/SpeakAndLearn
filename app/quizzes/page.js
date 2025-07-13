"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useQuiz } from '@/app/context/QuizContext';
import { useRequireAuth } from '@/app/hooks/useAuthGuard';
import AuthGuard from '@/app/components/AuthGuard';
import StudentFooter from '../components/StudentFooter';

// Fallback images for quizzes without uploaded banners
const quizImages = {
  "Solar System": "/pictures/nasagetsnewc.jpg",
  "World Capitals": "/pictures/Botany20Bay.jpg",
  "Basic Algebra": "/pictures/istockphoto-175432830-612x612.jpg",
  "Chemistry Basics": "/pictures/recycled-robots1.png",
};

const defaultImage = "/image.webp"; // Changed from pumpkin to placeholder

const subjectColors = {
  Maths: 'text-blue-600',
  Science: 'text-green-600',
  English: 'text-yellow-800',
  History: 'text-red-600',
  Geography: 'text-purple-600',
  Default: 'text-gray-600',
};

const subjectTagColors = {
  Maths: 'bg-blue-100 text-blue-800',
  Science: 'bg-green-100 text-green-800',
  English: 'bg-yellow-100 text-yellow-800',
  History: 'bg-red-100 text-red-800',
  Geography: 'bg-purple-100 text-purple-800',
  Default: 'bg-gray-100 text-gray-800',
};

function QuizzesContent() {
  const { quizzes = [], loading, error, refreshQuizzes } = useQuiz();
  const { user } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading quizzes</p>
            <p>{error}</p>
          </div>
          <button
            onClick={refreshQuizzes}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col"> {/* Added flex flex-col to parent div */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex flex-col items-center justify-center"> {/* Added flex-grow, flex flex-col, items-center, justify-center */}
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Explore Quizzes</h1>
          <p className="text-xl text-gray-600">Choose a topic to start your learning adventure!</p>
          {user && (
            <div className="mt-4 text-lg text-gray-700">
              Welcome back, <span className="font-semibold">{user.email}</span>!
            </div>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md">
              <p className="font-bold text-lg">No quizzes available right now.</p>
              <p>Please check back later for new and exciting quizzes!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {quizzes.map((quiz) => {
              const imageSrc = quiz.bannerUrl || defaultImage;
              const colorClass = subjectColors[quiz.category] || subjectColors.Default;

              return (
                <Link href={`/quizzes/${quiz.id}`} key={quiz.id}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full">
                    {/* Image */}
                    <div className="relative w-full h-48">
                      <Image
                        src={imageSrc}
                        alt={quiz.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Quiz info */}
                    <div className="p-6 flex flex-col flex-grow">
                      <p className={`text-sm font-semibold ${colorClass} mb-1`}>{quiz.subject}</p>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm flex-grow">{quiz.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {quiz.category && (
                          <span
                            className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full ${
                              subjectTagColors[quiz.category] || subjectTagColors.Default
                            }`}
                          >
                            {quiz.category}
                          </span>
                        )}
                        {quiz.difficulty && (
                          <span
                            className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full ${
                              quiz.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800'
                                : quiz.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {quiz.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <StudentFooter />
    </div>
  );
}

export default function PlayerQuizzesPage() {
  return (
    <AuthGuard requireAuth={true}>
      <QuizzesContent />
    </AuthGuard>
  );
}