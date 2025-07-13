"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/app/context/QuizContext';
import { useRequireAuth } from '@/app/hooks/useAuthGuard';
import AuthGuard from '@/app/components/AuthGuard';
import ImageDropzone from '@/app/components/ImageDropzone';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase'

const subjects = ['Maths', 'Science', 'English', 'History', 'Geography'];
const difficultyLevels = ['Easy', 'Medium', 'Hard'];
const difficultyColorClasses = {
    Easy: 'text-green-700',
    Medium: 'text-yellow-700',
    Hard: 'text-red-700',
  };

function NewQuizContent() {
  const [quizFiles, setQuizFiles] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [questionType, setQuestionType] = useState('image');
  const [textQuestions, setTextQuestions] = useState([{ question: '', answer: '' }]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [timePerQuestion, setTimePerQuestion] = useState(30); // Default 30 seconds per question
  const { addQuiz, refreshQuizzes } = useQuiz();
  const { user } = useRequireAuth();
  const router = useRouter();

  const handleQuizFilesChange = (files) => {
    setQuizFiles(files);
  };

  const handleBannerFileChange = (files) => {
    setBannerFile(files[0] || null);
  };

  const handleAddTextQuestion = () => {
    setTextQuestions([...textQuestions, { question: '', answer: '' }]);
  };

  const handleRemoveTextQuestion = (index) => {
    if (textQuestions.length > 1) {
      const newTextQuestions = textQuestions.filter((_, i) => i !== index);
      setTextQuestions(newTextQuestions);
    }
  };

  const handleTextQuestionChange = (index, field, value) => {
    const newTextQuestions = [...textQuestions];
    newTextQuestions[index][field] = value;
    setTextQuestions(newTextQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let questions = [];
    let bannerImageUrl = null;

    try {
        if (bannerFile && bannerFile.file) {
            const fileExt = bannerFile.file.name.split('.').pop();
            const fileName = `banner-${uuidv4()}.${fileExt}`;
            const filePath = `banners/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('questions')
              .upload(filePath, bannerFile.file);

            if (uploadError) {
              console.error('Banner upload failed:', uploadError.message);
            } else {
                const { data: publicData } = supabase.storage
                .from('questions')
                .getPublicUrl(filePath);
                bannerImageUrl = publicData.publicUrl;
            }
          }

        if (questionType === 'image') {
            const uploadedQuestions = await Promise.all(
            quizFiles.map(async (item) => {
                if (!item.file) return null;

                const fileExt = item.file.name.split('.').pop();
                const fileName = `${uuidv4()}.${fileExt}`;
                const filePath = `quizzes/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                .from('questions')
                .upload(filePath, item.file);

                if (uploadError) {
                console.error('Upload failed:', uploadError.message);
                return null;
                }

                const { data: publicData } = supabase.storage
                .from('questions')
                .getPublicUrl(filePath);

                return {
                imageUrl: publicData.publicUrl,
                answer: item.description || '',
                };
            })
            );
            questions = uploadedQuestions.filter(Boolean);
        } else {
            questions = textQuestions.map(q => ({
            questionText: q.question,
            answer: q.answer,
          }));
        }

        const newQuiz = {
            title: formData.get('title'),
            subject: formData.get('subject'),
            description: formData.get('description'),
            difficulty: difficulty,
            bannerUrl: bannerImageUrl,
            timePerQuestion: timePerQuestion,
            questions,
        };

        addQuiz(newQuiz);
        refreshQuizzes();
        router.push('/admin/quizzes');
    }
    catch (err) {
        console.error('Quiz creation failed:', err);
      }
  }

  return (
    <div className="min-h-screen bg-blue-50 text-gray-900">
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin/quizzes" className="text-blue-600 hover:text-blue-800 font-semibold">
              &larr; Cancel
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Create New Quiz</h1>
              {user && (
                <p className="text-sm text-gray-600">User: {user.email}</p>
              )}
            </div>
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
                  placeholder="e.g. History of Australia"
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
              <label className="block text-gray-800 font-semibold mb-2">Banner Image</label>
              <ImageDropzone onFilesChange={handleBannerFileChange} />
              <p className="text-sm text-gray-600 mt-2">
                Upload a banner image for your quiz. This will be displayed on the quiz card and details page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-gray-800 font-semibold mb-2">Question Type</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="questionType"
                      value="image"
                      checked={questionType === 'image'}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="mr-2"
                    />
                    Image Questions
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="questionType"
                      value="text"
                      checked={questionType === 'text'}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="mr-2"
                    />
                    Text Questions
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="timePerQuestion" className="block text-gray-800 font-semibold mb-2">Time Per Question (seconds)</label>
                <input
                  type="number"
                  id="timePerQuestion"
                  name="timePerQuestion"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  min="10"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-800 font-semibold mb-2">Difficulty Level</label>
              <div className="flex items-center gap-4">
                {difficultyLevels.map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="mr-2"
                    />
                    <span className={`${difficultyColorClasses[level]} font-medium`}>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {questionType === 'image' ? (
              <div className="mb-4">
                <label className="block text-gray-800 font-semibold mb-2">Quiz Images</label>
                <ImageDropzone onFilesChange={handleQuizFilesChange} />
                <p className="text-sm text-gray-600 mt-2">
                  Upload images for your quiz. Each image should represent a question that students will answer by describing what they see.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-gray-800 font-semibold mb-2">Text Questions</label>
                {textQuestions.map((q, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                      {textQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTextQuestion(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your question"
                      value={q.question}
                      onChange={(e) => handleTextQuestionChange(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Enter the expected answer"
                      value={q.answer}
                      onChange={(e) => handleTextQuestionChange(index, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTextQuestion}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add Another Question
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
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

export default function NewQuizPage() {
  return (
    <AuthGuard requireAuth={true}>
      <NewQuizContent />
    </AuthGuard>
  );
}
