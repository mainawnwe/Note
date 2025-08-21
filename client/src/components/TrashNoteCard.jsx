import React, { useState } from 'react';
import { RotateCcw, Trash2, Archive, Clock, Tag, Pin } from 'lucide-react';
import PermanentDeleteConfirmation from './PermanentDeleteConfirmation';

const TrashNoteCard = ({
  note,
  onRestore,
  onPermanentDelete,
  darkMode,
  isSelected,
  onSelect,
  ...noteProps
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(note.id);
    }
  };

  const handlePermanentDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onPermanentDelete(note.id);
    setShowDeleteConfirmation(false);
  };

  const handleRestore = () => {
    onRestore(note.id);
  };

  // Determine if note has a reminder that's due
  const isReminderDue = note.reminder && new Date(note.reminder) <= new Date();

  // Base card classes
  let cardClasses = `rounded-2xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer relative ${darkMode ? 'bg-gray-800' : 'bg-white'
    }`;

  // Add border for reminders that are due
  if (isReminderDue) {
    cardClasses += ` border-l-4 ${darkMode ? 'border-amber-500' : 'border-amber-500'}`;
  }

  // Add pin indicator
  if (note.pinned) {
    cardClasses += ` ${darkMode ? 'border-t-4 border-blue-500' : 'border-t-4 border-blue-500'}`;
  }

  return (
    <>
      <div
        className={cardClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={handleSelect}
            className="absolute top-3 left-3 z-10 h-5 w-5 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {note.title || 'Untitled Note'}
            </h3>
            <div className="flex space-x-1">
              {note.pinned && (
                <div className={`p-1 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Pin className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              )}
              {note.reminder && (
                <div className={`p-1 rounded-full ${isReminderDue ? (darkMode ? 'bg-amber-900/30' : 'bg-amber-100') : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
                  <Clock className={`h-4 w-4 ${isReminderDue ? (darkMode ? 'text-amber-400' : 'text-amber-600') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`} />
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-3`}>
              {note.content || 'No content'}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
            <div className="flex space-x-1">
              {note.labels && note.labels.slice(0, 2).map((label, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {typeof label === 'object' ? label.name : label}
                </span>
              ))}
              {note.labels && note.labels.length > 2 && (
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                  +{note.labels.length - 2}
                </span>
              )}
            </div>
          </div>

          {isHovered && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <button
                onClick={handleRestore}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${darkMode
                    ? 'bg-teal-900/30 text-teal-400 hover:bg-teal-800/50'
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                  }`}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restore
              </button>
              <button
                onClick={handlePermanentDelete}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${darkMode
                    ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Forever
              </button>
            </div>
          )}
        </div>
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

export default TrashNoteCard;