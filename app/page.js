
"use client";
import Link from 'next/link';
import { GiBrain, GiMicrophone, GiGamepad } from 'react-icons/gi';
import { FaQuoteLeft } from 'react-icons/fa';
import { useSupabase } from './context/SupabaseContext';

const HeroSection = () => {
  const { user } = useSupabase();

  return (
    <section className="animated-gradient text-white">
      <div className="container mx-auto flex flex-col items-center px-4 pt-32 pb-25 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          <span className="block mb-2">SpeakAndLearn.ai</span>
          <span className="block text-yellow-300">Where Learning Meets Speaking and Fun</span>
        </h1>
        <p className="mt-6 text-lg text-white/90 max-w-3xl">
          A revolutionary tool that helps kids learn by speaking, featuring interactive quizzes, creative challenges, and real-time growth.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link href={user ? "/quizzes" : "/auth"}>
            <button className="px-10 py-4 text-xl font-bold rounded-full bg-white text-blue-600 shadow-2xl transform hover:scale-110 transition-all duration-300 ease-in-out">
              Start Your Adventure
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
 
    <section className="bg-blue-50 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
        
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
            Why You'll Love It
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Everything you need to make learning fun and effective.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
         
          <div className="text-center p-8 rounded-2xl shadow-xl bg-white border border-slate-200">
   
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full">
              <GiBrain className="w-10 h-10 text-blue-500" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Speak and Learn</h3>
            <p className="text-slate-600">
              Your child builds confidence in speaking while learning real-world knowledge—turning practice into progress every time they talk.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl shadow-xl bg-white border border-slate-200">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
              <GiMicrophone className="w-10 h-10 text-green-500" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Confidence for the Quiet</h3>
            <p className="text-slate-600">
              Whether they’re shy or unsure, our gentle speaking games help your child find their voice and feel good using it.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl shadow-xl bg-white border border-slate-200">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full">
              <GiGamepad className="w-10 h-10 text-yellow-500" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Learning That Feels Fun</h3>
            <p className="text-slate-600">
              No more boring drills. Our engaging prompts make learning feel like a game—so your child keeps coming back for more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SocialProofSection = () => {
  return (
    <section className="bg-off-white py-24">
      <div className="container mx-auto px-4">
      
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
       
          <figure className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative">
            
            <FaQuoteLeft className="absolute top-6 left-6 w-8 h-8 text-slate-200" aria-hidden="true" />
            <blockquote className="relative z-10 italic text-slate-700 text-lg">
              "I wish I was a child so that I could play on this all day!"
            </blockquote>
           
            <figcaption className="mt-6 text-right">
              <p className="font-bold text-slate-800">- Prabesh Ojha</p>
            </figcaption>
          </figure>
         
          <figure className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative">
            <FaQuoteLeft className="absolute top-6 left-6 w-8 h-8 text-slate-200" aria-hidden="true" />
            <blockquote className="relative z-10 italic text-slate-700 text-lg">
              "My brother really loves this! He's a shy one but it's great to hear him talk so much!"
            </blockquote>
            <figcaption className="mt-6 text-right">
              <p className="font-bold text-slate-800">- Michael Feng</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

const FooterSection = () => (
    
    <footer className="bg-blue-50 py-8 border-t border-slate-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} SpeakAndLearn.ai. All Rights Reserved.</p>
            <div className="flex gap-6 text-sm">
                <Link href="#" className="text-slate-700 hover:text-blue-500 font-medium">Privacy Policy</Link>
                <Link href="#" className="text-slate-700 hover:text-blue-500 font-medium">Terms of Service</Link>
            </div>
        </div>
    </footer>
);
export default function HomePage() {
  return (
    <div className="bg-slate-50"> 
      <main>
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
      </main>
      <FooterSection />
    </div>
  );
}