"use client";

import Link from 'next/link';
import Image from 'next/image';
import StudentFooter from '@/app/components/StudentFooter';

// CURRENTLY HARDCODED
const games = [
  {
    title: "Adjective Challenge",
    description: "Look at images and generate as many descriptive adjectives as possible! Your creativity and accuracy will be evaluated.",
    image: "/pictures/fruits-plate-green-plum-strawberry-banana-kiwi-watermelon-orange-apple_72594-822.avif",
    link: "/games/adjective-challenge"
  },
  {
    title: "Metaphor Match-Up",
    description: "Match the metaphors to their meanings in this fast-paced challenge!",
    image: "/pictures/superhero-child-jumping-against-grey-concrete-wall_411285-304.avif",
    link: "#" 
  },
  {
    title: "Synonym Scramble",
    description: "Unscramble the letters to find the synonyms of common words.",
    image: "/pictures/student-s-backpack-overflowing-with-books-papers_964851-5514.avif",
    link: "#"
  },
  {
    title: "Punctuation Power",
    description: "Correct the punctuation in sentences to score points and master grammar.",
    image: "/pictures/recycled-robots1.png",
    link: "#"
  }
];

const defaultImage = "/pictures/SA-pumpkins.jpg";

export default function PlayerGamesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex flex-col items-center"> {/* Removed justify-center to align content to the top */}
        <div className="mb-12 text-center mt-12"> {/* Added mt-12 for top margin */}
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Interactive Games</h1>
          <p className="text-xl text-gray-600">Sharpen your skills with these fun and engaging games!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map((game, index) => (
            <Link href={game.link} key={index}>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full">
                {/* Image container (same as quizzes) */}
                <div className="relative w-full h-48">
                  <Image
                    src={game.image || defaultImage}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
                  <p className="text-gray-600 text-sm flex-grow">{game.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}
