// app/components/LandingNavbar.js
import Link from 'next/link';
import Image from 'next/image';
import NavbarAuthItems from './NavbarAuthItems';

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3">
                <Image 
                    src="/image.webp" 
                    alt="SpeakAndLearn Logo" 
                    width={56}
                    height={56}
                    className="object-contain"
                />
                <span className="text-2xl font-bold text-gray-900">SpeakAndLearn.ai</span>
            </Link>
          </div>
          <NavbarAuthItems />
        </div>
      </div>
    </header>
  );
}