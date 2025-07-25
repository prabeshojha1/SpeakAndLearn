'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../context/SupabaseContext'

export default function AuthControls() {
  const { user, supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
      setShowDropdown(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-6">
        <Link
          href="/auth"
          className="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/auth"
          className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 px-6 py-2 rounded-full text-base font-medium transition-colors"
        >
          Get Started
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium text-base">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <span className="hidden md:block text-base font-medium">{user.email}</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-medium text-gray-900">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            
            <Link
              href="/player/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setShowDropdown(false)}
            >
              Profile
            </Link>
            
            <Link
              href="/quizzes"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setShowDropdown(false)}
            >
              My Quizzes
            </Link>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 