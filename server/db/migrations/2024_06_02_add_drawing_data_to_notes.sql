-- Migration to add drawing_data column to notes table
ALTER TABLE notes
ADD COLUMN drawing_data LONGTEXT NULL AFTER content;
