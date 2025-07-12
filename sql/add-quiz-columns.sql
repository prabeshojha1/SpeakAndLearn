-- Add columns for enhanced quiz functionality
-- Run this in your Supabase SQL Editor

-- Add time_per_question column (in seconds)
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS time_per_question INTEGER DEFAULT 30;

-- Add difficulty column if it doesn't exist
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium';

-- Add banner_url column if it doesn't exist
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add constraints to ensure valid difficulty values
ALTER TABLE quizzes 
ADD CONSTRAINT IF NOT EXISTS check_difficulty 
CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Add constraints for time_per_question (10 seconds to 5 minutes)
ALTER TABLE quizzes 
ADD CONSTRAINT IF NOT EXISTS check_time_per_question 
CHECK (time_per_question >= 10 AND time_per_question <= 300);

-- Add comments for documentation
COMMENT ON COLUMN quizzes.time_per_question IS 'Time allowed per question in seconds (10-300)';
COMMENT ON COLUMN quizzes.difficulty IS 'Quiz difficulty level: easy, medium, or hard';
COMMENT ON COLUMN quizzes.banner_url IS 'URL to the quiz banner image stored in Supabase Storage';

-- Create index for better performance when filtering by difficulty
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_time_per_question ON quizzes(time_per_question); 