-- Fix RLS policies for quizzes table
-- This allows public read access to active quizzes

-- Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Users can view active quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view questions for active quizzes" ON questions;

-- Create new policies that allow public read access
CREATE POLICY "Public can view active quizzes" ON quizzes
    FOR SELECT USING (is_active = true);

-- If you have questions table, allow public access to questions of active quizzes
CREATE POLICY "Public can view questions for active quizzes" ON questions
    FOR SELECT USING (
        quiz_id IN (SELECT id FROM quizzes WHERE is_active = true)
    );

-- Alternative: If you want to temporarily disable RLS for testing
-- ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions DISABLE ROW LEVEL SECURITY; 