"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/app/context/QuizContext';
import ImageDropzone from '@/app/components/ImageDropzone';

const subjects = ['Maths', 'Science', 'English', 'History', 'Geography'];

export default function NewQuizPage() {
  const [quizFiles, setQuizFiles] = useState([]);
  const { addQuiz } = useQuiz();
  const router = useRouter();

  const handleFilesChange = (files) => {
    setQuizFiles(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newQuiz = {
      title: formData.get('title'),
      subject: formData.get('subject'),
      description: formData.get('description'),
      questions: quizFiles.map(f => ({
        imageUrl: f.preview,
        description: f.description
      }))
    };
    addQuiz(newQuiz);
    router.push('/admin/quizzes');
  };

  return (
    <div className="min-h-screen bg-blue-50 text-gray-900">
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin/quizzes" className="text-blue-600 hover:text-blue-800 font-semibold">
              &larr; Cancel
            </Link>
            <h1 className="text-2xl font-bold">Create New Quiz</h1>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="title" className="block text-gray-800 font-semibold mb-2">Quiz Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g., The Romans"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-gray-800 font-semibold mb-2">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-800 font-semibold mb-2">Quiz Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                placeholder="A brief overview for the student..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-800 font-semibold mb-2">Quiz Questions (Images & Answers)</label>
              <ImageDropzone onFilesChange={handleFilesChange} />
              <p className="text-sm text-gray-700 mt-2">
                The descriptions you enter will be used as the 'correct answer' for the AI to grade against.
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-transform hover:scale-105"
              >
                Create Quiz
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
