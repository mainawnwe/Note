-- Add 'status' column to notes table to support active, archived, trashed states
ALTER TABLE notes
ADD COLUMN status ENUM('active', 'archived', 'trashed') NOT NULL DEFAULT 'active';
