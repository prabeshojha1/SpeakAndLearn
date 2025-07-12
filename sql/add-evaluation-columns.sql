-- Add evaluation columns to game_sessions table
-- Run this in Supabase SQL Editor

-- Add evaluation columns
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS evaluation_results JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS evaluation_status VARCHAR(50) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS evaluation_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_evaluation BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on has_evaluation
CREATE INDEX IF NOT EXISTS idx_game_sessions_has_evaluation 
ON game_sessions (has_evaluation);

-- Add index for faster queries on evaluation_completed_at
CREATE INDEX IF NOT EXISTS idx_game_sessions_evaluation_completed_at 
ON game_sessions (evaluation_completed_at);

-- Add index for faster queries on evaluation_status
CREATE INDEX IF NOT EXISTS idx_game_sessions_evaluation_status 
ON game_sessions (evaluation_status);

-- Add comment for documentation
COMMENT ON COLUMN game_sessions.evaluation_results IS 'JSONB containing OpenAI evaluation of user responses including scores, feedback, and understanding levels';
COMMENT ON COLUMN game_sessions.evaluation_status IS 'Status of evaluation process: not_started, in_progress, completed, failed';
COMMENT ON COLUMN game_sessions.evaluation_completed_at IS 'Timestamp when the evaluation was completed';
COMMENT ON COLUMN game_sessions.has_evaluation IS 'Quick flag to check if evaluation exists for this session'; 