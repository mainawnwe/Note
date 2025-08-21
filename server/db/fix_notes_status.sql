-- Fix notes status column to ensure all notes have proper status values
-- This addresses the issue where deleted notes don't appear in trash

-- First, update any NULL status values to 'active' for existing notes
UPDATE notes 
SET status = 'active' 
WHERE status IS NULL;

-- Ensure the status column has proper constraints
ALTER TABLE notes 
MODIFY COLUMN status ENUM('active', 'archived', 'trashed') NOT NULL DEFAULT 'active';

-- Check current status distribution
SELECT status, COUNT(*) as count 
FROM notes 
GROUP BY status;