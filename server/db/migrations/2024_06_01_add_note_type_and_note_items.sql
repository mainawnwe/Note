-- Add 'type' column to notes table
ALTER TABLE notes
ADD COLUMN type ENUM('note', 'list', 'drawing', 'image') NOT NULL DEFAULT 'note';

-- Create note_items table for list items
CREATE TABLE IF NOT EXISTS note_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    text TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);
