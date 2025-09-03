import React, { useState } from 'react';
import Note from './Note';
import NoteCheckbox from './NoteCheckbox';

const SelectableNoteCard = ({
  note,
  darkMode,
  isSelectionMode = false,
  isSelected = false,
  onSelectionChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleSelectionChange = (noteId, selected) => {
    if (onSelectionChange) {
      onSelectionChange(noteId, selected);
    }
  };

  return (
    <div
      className={`relative ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-2xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Note
        {...{
          ...note,
          // Map backend fields to Note's expected props so previews render
          imageData: note.imageData ?? note.image_url ?? null,
          drawingData: note.drawingData ?? note.drawing_data ?? null,
        }}
        darkMode={darkMode}
        // Disable opening editor in selection mode by omitting onOpenNoteEditor
        onOpenNoteEditor={isSelectionMode ? undefined : note.onOpenNoteEditor}
        onDelete={note.onDelete}
        onUpdate={note.onUpdate}
      />

      {isSelectionMode && (
        <div className="absolute top-2 left-2" style={{ zIndex: 15 }}>
          <NoteCheckbox
            isSelected={isSelected}
            onChange={handleSelectionChange}
            noteId={note.id}
            darkMode={darkMode}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          />
        </div>
      )}
    </div>
  );
};

export default SelectableNoteCard;
