import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

const NoteCheckbox = ({
  isSelected,
  onChange,
  noteId,
  darkMode,
  className = ""
}) => {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent note card click
    onChange(noteId, !isSelected);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1 rounded transition-colors ${
        darkMode
          ? 'hover:bg-gray-600 text-gray-300'
          : 'hover:bg-gray-100 text-gray-600'
      } ${className}`}
      title={isSelected ? 'Deselect note' : 'Select note'}
    >
      {isSelected ? (
        <CheckSquare 
          size={20} 
          className={darkMode ? 'text-blue-400' : 'text-blue-600'} 
        />
      ) : (
        <Square 
          size={20} 
          className={darkMode ? 'text-gray-400' : 'text-gray-500'} 
        />
      )}
    </button>
  );
};

export default NoteCheckbox;