'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../context/SupabaseContext';

export default function AuthCallback() {
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=callback_error');
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to home
          router.push('/');
        } else {
          // No session, redirect to auth
          router.push('/auth');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        router.push('/auth?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
} 