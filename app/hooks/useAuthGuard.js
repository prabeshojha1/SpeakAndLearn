'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/context/SupabaseContext';

export function useAuthGuard(options = {}) {
  const {
    requireAuth = true,
    requireAdmin = false,
    redirectTo = '/auth',
    redirectOnAuth = null, // Where to redirect authenticated users (useful for auth pages)
  } = options;

  const { user, loading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect authenticated users away from auth pages
      if (redirectOnAuth && user) {
        router.push(redirectOnAuth);
        return;
      }

      // Redirect unauthenticated users from protected pages
      if (requireAuth && !user) {
        router.push(redirectTo);
        return;
      }

      // Check admin access
      if (requireAdmin && user) {
        const isAdmin = user.email?.includes('admin') || user.user_metadata?.role === 'admin';
        if (!isAdmin) {
          router.push('/');
          return;
        }
      }
    }
  }, [user, loading, requireAuth, requireAdmin, router, redirectTo, redirectOnAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user && (user.email?.includes('admin') || user.user_metadata?.role === 'admin'),
  };
}

export function useRequireAuth(redirectTo = '/auth') {
  return useAuthGuard({ requireAuth: true, redirectTo });
}

export function useRequireAdmin(redirectTo = '/') {
  return useAuthGuard({ requireAuth: true, requireAdmin: true, redirectTo });
}

export function useRedirectIfAuthenticated(redirectTo = '/quizzes') {
  return useAuthGuard({ requireAuth: false, redirectOnAuth: redirectTo });
} 