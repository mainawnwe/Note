import React, { useState } from 'react';
import { Trash2, Edit3, Save, XCircle, Pin } from 'lucide-react';

export default function Note(props) {
  const { id, title, content, createdAt, pinned, color, onDelete, onUpdate, darkMode } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [isPinned, setIsPinned] = useState(pinned || false);

  const handleDelete = () => onDelete(id);
  const handleEdit = () => setIsEditing(true);

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    onUpdate(id, { pinned: newPinned ? 1 : 0 });
  };

  const handleSave = () => {
    if (editedTitle.trim() === '' && editedContent.trim() === '') return;
    onUpdate(id, { title: editedTitle, content: editedContent, pinned: isPinned ? 1 : 0 });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(title);
    setEditedContent(content);
    setIsPinned(pinned || false);
    setIsEditing(false);
  };

  // Improved date formatting for MySQL datetime and other formats
  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return 'Date unknown';
    }

    // Try to parse date string with or without time
    let safeDateString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');

    // Fallback: if still invalid, try replacing space with 'T' and appending 'Z' for UTC
    let dateObj = new Date(safeDateString);
    if (isNaN(dateObj.getTime())) {
      safeDateString = dateString.replace(' ', 'T') + 'Z';
      dateObj = new Date(safeDateString);
    }

    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  // Calculate text color based on background brightness
  const getTextColor = (bgColor) => {
    if (!bgColor || bgColor === '#ffffff') return darkMode ? 'text-gray-700' : 'text-gray-900';

    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate brightness (perceived luminance)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 150 ? 'text-gray-900' : 'text-gray-100';
  };

  const textColor = getTextColor(color);

  return (
    <div
      className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 break-inside-avoid
                 shadow-lg hover:shadow-xl ${darkMode
          ? 'border border-gray-700'
          : 'border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
        }`}
      style={{
        backgroundColor: color || (darkMode ? '#303134' : '#ffffff'),
        minHeight: '150px'
      }}
    >
      {isEditing ? (
        <div className="flex flex-col h-full">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className={`font-bold text-xl mb-2 p-2 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none ${darkMode
                ? 'bg-gray-800 text-white border-gray-700'
                : 'bg-white text-gray-900 border-gray-300'
              } border`}
            placeholder="Title"
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className={`text-base mb-3 p-2 rounded-md resize-none h-32 focus:ring-2 focus:ring-amber-500 focus:outline-none ${darkMode
                ? 'bg-gray-800 text-gray-200 border-gray-700'
                : 'bg-white text-gray-700 border-gray-300'
              } border`}
            placeholder="Content"
          />
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={togglePin}
              className={`p-2 rounded-full transition-colors ${isPinned
                  ? 'bg-amber-300 text-amber-800 dark:bg-amber-600 dark:text-amber-100'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin size={18} />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-colors flex items-center"
              >
                <Save size={18} className="mr-1" />
                <span className="text-xs">Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-full shadow-md transition-colors flex items-center dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
              >
                <XCircle size={18} className="mr-1" />
                <span className="text-xs">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start">
            <h3 className={`font-bold text-lg mb-2 break-words ${textColor}`}>
              {title || "Untitled Note"}
            </h3>
            <button
              onClick={togglePin}
              className={`p-2 rounded-full transition-colors ${isPinned
                  ? 'bg-amber-300 text-amber-800 dark:bg-amber-600 dark:text-amber-100'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin size={18} />
            </button>
          </div>
          <p className={`text-sm mb-3 whitespace-pre-wrap break-words ${textColor.replace('text-gray-800', 'text-gray-700').replace('text-gray-300', 'text-gray-400')}`}>
            {content}
          </p>
          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-xs mb-3 ${textColor.replace('text-gray-800', 'text-gray-600').replace('text-gray-300', 'text-gray-500')}`}>
              {formatDate(createdAt)}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEdit}
                className={`p-2 rounded-full transition-colors ${darkMode
                    ? 'text-blue-400 hover:bg-blue-900/30'
                    : 'text-blue-500 hover:bg-blue-100'
                  }`}
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={handleDelete}
                className={`p-2 rounded-full transition-colors ${darkMode
                    ? 'text-red-400 hover:bg-red-900/30'
                    : 'text-red-500 hover:bg-red-100'
                  }`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}