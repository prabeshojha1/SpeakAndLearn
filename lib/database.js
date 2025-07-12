import { supabase } from './supabase'

// Database table names
export const TABLES = {
  USERS: 'users',
  QUIZZES: 'quizzes',
  QUESTIONS: 'questions',
  USER_PROGRESS: 'user_progress',
  GAME_SESSIONS: 'game_sessions'
}

// Helper functions for common database operations
export const db = {
  // User operations
  async getUser(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async isUserAdmin(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data?.role === 'admin'
  },

  async isUserPlayer(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data?.role === 'player'
  },

  // Quiz operations (admin-only creation, all users can view)
  async getQuizzes() {
    const { data, error } = await supabase
      .from(TABLES.QUIZZES)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getQuiz(quizId) {
    const { data, error } = await supabase
      .from(TABLES.QUIZZES)
      .select(`
        *,
        questions (*)
      `)
      .eq('id', quizId)
      .eq('is_active', true)
      .single()
    
    if (error) throw error
    return data
  },

  async createQuiz(quizData, userId) {
    // Check if user is admin
    const isAdmin = await this.isUserAdmin(userId)
    if (!isAdmin) {
      throw new Error('Only admins can create quizzes')
    }

    const { data, error } = await supabase
      .from(TABLES.QUIZZES)
      .insert({
        ...quizData,
        created_by: userId
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateQuiz(quizId, updates, userId) {
    // Check if user is admin
    const isAdmin = await this.isUserAdmin(userId)
    if (!isAdmin) {
      throw new Error('Only admins can update quizzes')
    }

    const { data, error } = await supabase
      .from(TABLES.QUIZZES)
      .update(updates)
      .eq('id', quizId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteQuiz(quizId, userId) {
    // Check if user is admin
    const isAdmin = await this.isUserAdmin(userId)
    if (!isAdmin) {
      throw new Error('Only admins can delete quizzes')
    }

    const { error } = await supabase
      .from(TABLES.QUIZZES)
      .delete()
      .eq('id', quizId)
    
    if (error) throw error
  },

  // Question operations (admin-only)
  async createQuestion(questionData, userId) {
    // Check if user is admin
    const isAdmin = await this.isUserAdmin(userId)
    if (!isAdmin) {
      throw new Error('Only admins can create questions')
    }

    const { data, error } = await supabase
      .from(TABLES.QUESTIONS)
      .insert(questionData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateQuestion(questionId, updates, userId) {
    // Check if user is admin
    const isAdmin = await this.isUserAdmin(userId)
    if (!isAdmin) {
      throw new Error('Only admins can update questions')
    }

    const { data, error } = await supabase
      .from(TABLES.QUESTIONS)
      .update(updates)
      .eq('id', questionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteQuestion(questionId, userId) {
    // Check if user is admin
    const isAdmin = await this.isUserAdmin(userId)
    if (!isAdmin) {
      throw new Error('Only admins can delete questions')
    }

    const { error } = await supabase
      .from(TABLES.QUESTIONS)
      .delete()
      .eq('id', questionId)
    
    if (error) throw error
  },



  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from(TABLES.USER_PROGRESS)
      .select(`
        *,
        quiz:quizzes (*)
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  async updateUserProgress(progressData) {
    const { data, error } = await supabase
      .from(TABLES.USER_PROGRESS)
      .upsert(progressData, { onConflict: 'user_id,quiz_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Game session operations (single-player)
  async createGameSession(userId, quizId) {
    const { data, error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .insert({
        user_id: userId,
        quiz_id: quizId,
        started_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getActiveGameSession(userId, quizId) {
    const { data, error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .eq('is_completed', false)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  async updateGameSession(sessionId, updates) {
    const { data, error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async completeGameSession(sessionId, finalScore, correctAnswers, sessionData = {}) {
    const { data, error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        score: finalScore,
        correct_answers: correctAnswers,
        session_data: sessionData
      })
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserGameSessions(userId) {
    const { data, error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .select(`
        *,
        quiz:quizzes (title, description, category)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
} 