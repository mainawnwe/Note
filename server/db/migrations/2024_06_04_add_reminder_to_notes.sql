-- Add 'reminder' column to notes table to support reminders feature
ALTER TABLE notes
ADD COLUMN reminder DATETIME NULL DEFAULT NULL;
