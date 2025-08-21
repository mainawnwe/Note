import React, { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import Note from './Note';
import PermanentDeleteConfirmation from './PermanentDeleteConfirmation';
import NoteCheckbox from './NoteCheckbox';

const SelectableTrashNoteCard = ({ 
  note, 
  onRestore, 
  onPermanentDelete, 
  darkMode,
  isSelectionMode = false,
  isSelected = false,
  onSelectionChange,
  ...noteProps 
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePermanentDelete = () => {
    if (note.type === 'image' || note.type === 'drawing') {
      console.log('Permanent deletion is not allowed for image and drawing notes.');
      return; // Prevent deletion
    }
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onPermanentDelete(note.id);
    setShowDeleteConfirmation(false);
  };

  const handleRestore = () => {
    onRestore(note.id);
  };

  const handleSelectionChange = (noteId, selected) => {
    if (onSelectionChange) {
      onSelectionChange(noteId, selected);
    }
  };

  return (
    <>
      <div
        className={`relative ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        onMouseEnter={() => {
          console.log('Mouse entered');
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          console.log('Mouse left');
          setIsHovered(false);
        }}
      >
        <Note
          {...note}
          {...noteProps}
          darkMode={darkMode}
          onDelete={() => {}} // Disable default delete
          onUpdate={() => {}} // Disable editing in trash
        />
        
        {/* Selection Checkbox */}
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
        
        {/* Trash Actions Overlay */}
        {(isHovered || isSelectionMode) && !isSelectionMode && (
          <div
            className={`absolute top-2 right-2 flex space-x-1 p-2 rounded-lg backdrop-blur-sm ${
              darkMode 
                ? 'bg-black/80 border border-gray-700' 
                : 'bg-white/90 border border-gray-200 shadow-lg'
            }`}
            style={{ zIndex: 10 }}
          >
            {/* Restore Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRestore();
              }}
              className={`p-2 rounded-md transition-colors ${
                darkMode
                  ? 'text-green-400 hover:bg-green-900/30 hover:text-green-300'
                  : 'text-green-600 hover:bg-green-50 hover:text-green-700'
              }`}
              title="Restore note"
            >
              <RotateCcw size={16} />
            </button>
            
            {/* Permanent Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePermanentDelete();
              }}
              className="p-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              title="Delete permanently"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Selection Mode Actions */}
        {isSelectionMode && isSelected && (
          <div
            className={`absolute top-2 right-2 flex space-x-1 p-2 rounded-lg backdrop-blur-sm ${
              darkMode 
                ? 'bg-blue-900/80 border border-blue-700' 
                : 'bg-blue-100/90 border border-blue-200 shadow-lg'
            }`}
            style={{ zIndex: 10 }}
          >
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              darkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Selected
            </span>
          </div>
        )}
      </div>

      <PermanentDeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        noteTitle={note.title || "Untitled Note"}
        darkMode={darkMode}
      />
    </>
  );
};

export default SelectableTrashNoteCard;
