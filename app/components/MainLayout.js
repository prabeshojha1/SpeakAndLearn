// app/components/MainLayout.js
"use client";

import { usePathname } from 'next/navigation';
import StudentHeader from './StudentHeader';
import LandingNavbar from './LandingNavbar';

export default function MainLayout({ children }) {
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith('/admin');
  const isLandingPage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPath && isLandingPage && <LandingNavbar />}
      {!isAdminPath && !isLandingPage && <StudentHeader />}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}