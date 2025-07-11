
import Link from 'next/link';

// Hardcoded results data
const results = {
  title: 'Life Cycles of a Plant',
  overallFeedback: 'Your explanations about the life cycle of a plant was excellent!',
  score: '10/10',
  breakdown: [
    { question: 'Describe the first stage.', feedback: 'Great job describing the seed stage!', recordingUrl: '#' },
    { question: 'Describe the second stage.', feedback: 'Excellent details on germination.', recordingUrl: '#' },
    { question: 'Describe the final stage.', feedback: 'Perfect explanation of the mature plant.', recordingUrl: '#' },
  ]
};

export default function QuizResultsPage({ params }) {
  const { quizId } = params;

  return (
    <div className="min-h-screen bg-pink-50">
      <header className="bg-pink-500 text-white p-4 text-center">
        <h1 className="text-3xl font-bold">Quiz Results</h1>
      </header>
      <main className="p-8">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-pink-800">{results.title}</h2>
            <p className="text-4xl font-extrabold text-green-500 my-4">{results.score}</p>
            <p className="text-lg text-gray-700">{results.overallFeedback}</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold">Detailed Feedback</h3>
            {results.breakdown.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg bg-pink-50/50">
                <p className="font-semibold">{item.question}</p>
                <p className="text-gray-600 my-2">{item.feedback}</p>
                <audio controls src={item.recordingUrl} className="w-full"></audio>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/quizzes">
              <button className="bg-pink-500 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-pink-600">
                Explore Other Quizzes
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
