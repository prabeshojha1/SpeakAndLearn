// app/auth/callback/page.js
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/context/SupabaseContext';

const Callback = () => {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const handleAuthentication = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
        router.push('/auth');
        return;
      }

      if (session) {
        // Redirect to the quizzes page upon successful login
        router.push('/quizzes');
      } else {
        // Handle the case where there is no session
        // This might happen if the user navigates here directly without logging in
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.push('/quizzes');
            // Clean up the subscription once we have the session
            if (subscription) {
              subscription.unsubscribe();
            }
          }
        });

        // Fallback for cases where the onAuthStateChange might not fire as expected
        setTimeout(() => {
            if (subscription) {
                subscription.unsubscribe();
            }
            if (!session) {
                router.push('/auth');
            }
        }, 5000);
      }
    };

    handleAuthentication();
  }, [supabase, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl">Please wait while we are redirecting you...</p>
    </div>
  );
};

export default Callback;
