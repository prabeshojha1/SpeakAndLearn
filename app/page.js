
import Link from 'next/link';
import LandingNavbar from '@/app/components/LandingNavbar';
import { FaLightbulb, FaUsers, FaChartLine, FaQuoteLeft } from 'react-icons/fa';


const HeroSection = () => (

  <section className="bg-white text-slate-800">
    <div className="container mx-auto flex flex-col items-center px-4 pt-24 pb-32 text-center">
      <h1>

        <span className="text-blue-500 text-10xl md:text-7xl font-bold leading-tight">
          SpeakAndLearn.ai
        </span>
      </h1>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
        The Ultimate Platform for<br />Interactive Quizzes
      </h1>
      <p className="mt-6 text-lg text-slate-600 max-w-2xl">
        Engage, learn, and compete. Create your own quizzes or take on challenges from others.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        
        <Link href="/quizzes">
          <button className="px-8 py-3 text-lg font-semibold rounded-lg bg-yellow-400 text-slate-800 shadow-lg transition-transform transform hover:scale-105">
            Start as a Student
          </button>
        </Link>
        
        <Link href="/admin/quizzes">
          <button className="px-8 py-3 text-lg font-semibold border-2 rounded-lg border-slate-300 text-slate-600 transition-all hover:bg-slate-100">
            Go to Admin Panel
          </button>
        </Link>
      </div>
    </div>
  </section>
);

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
              <FaLightbulb className="w-10 h-10 text-blue-500" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Create & Share</h3>
            <p className="text-slate-600">
              Easily build custom quizzes with various question types and share them with a unique link.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl shadow-xl bg-white border border-slate-200">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
              <FaUsers className="w-10 h-10 text-green-500" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Compete with Friends</h3>
            <p className="text-slate-600">
              Challenge your friends in real-time and see who comes out on top with live leaderboards.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl shadow-xl bg-white border border-slate-200">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full">
              <FaChartLine className="w-10 h-10 text-yellow-500" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Track Your Progress</h3>
            <p className="text-slate-600">
              Get detailed insights into your performance and track your learning journey over time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SocialProofSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
      
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
       
          <figure className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative">
            
            <FaQuoteLeft className="absolute top-6 left-6 w-8 h-8 text-slate-200" aria-hidden="true" />
            <blockquote className="relative z-10 italic text-slate-700 text-lg">
              "This is the best quiz platform I've ever used. So intuitive and engaging for my students!"
            </blockquote>
           
            <figcaption className="mt-6 text-right">
              <p className="font-bold text-slate-800">- Jane Doe</p>
              <p className="text-sm text-slate-500">High School Teacher</p>
            </figcaption>
          </figure>
         
          <figure className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative">
            <FaQuoteLeft className="absolute top-6 left-6 w-8 h-8 text-slate-200" aria-hidden="true" />
            <blockquote className="relative z-10 italic text-slate-700 text-lg">
              "Competing with my friends is so much fun. I'm actually motivated to study now."
            </blockquote>
            <figcaption className="mt-6 text-right">
              <p className="font-bold text-slate-800">- John Smith</p>
              <p className="text-sm text-slate-500">University Student</p>
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