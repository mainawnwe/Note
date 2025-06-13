import React, { useState } from 'react';
import { Trash2, Edit3, Save, XCircle } from 'lucide-react';

export default function Note(props) {
  const { id, title, content, createdAt, pinned, color, onDelete, onUpdate } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [isPinned, setIsPinned] = useState(pinned || false);

  const handleDelete = () => onDelete(id);
  const handleEdit = () => setIsEditing(true);

  const togglePin = () => {
    const newPinned = !isPinned ? 1 : 0;
    setIsPinned(Boolean(newPinned));
    onUpdate({ id, pinned: newPinned });
  };

  const handleSave = () => {
    if (editedTitle.trim() === '' && editedContent.trim() === '') return;
    onUpdate({ id, title: editedTitle, content: editedContent, pinned: isPinned ? 1 : 0 });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(title);
    setEditedContent(content);
    setIsPinned(pinned || false);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="rounded-lg shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200 break-inside-avoid" style={{ backgroundColor: color || '#ffffff', minHeight: '120px' }}>
      {isEditing ? (
        <div className="flex flex-col h-full">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="font-bold text-xl mb-2 p-2 border border-slate-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="Title"
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="text-slate-700 text-base mb-3 p-2 border border-slate-300 rounded-md resize-none h-32 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Content"
          />
          <div className="flex justify-between items-center mt-auto">
            <button
              onClick={togglePin}
              className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-yellow-300' : 'bg-slate-200 hover:bg-slate-300'}`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPinned ? 'text-yellow-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-colors"
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-slate-300 hover:bg-slate-400 text-slate-700 p-2 rounded-full shadow-md transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        </div>
        ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-base mb-2 break-words">{title || "Untitled Note"}</h3>
            <button
              onClick={togglePin}
              className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-yellow-300' : 'bg-slate-200 hover:bg-slate-300'}`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPinned ? 'text-yellow-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            </button>
          </div>
          <p className="text-slate-700 text-sm mb-3 whitespace-pre-wrap break-words">{content}</p>
          <div className="mt-auto pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3">
              {createdAt ? `Created: ${formatDate(createdAt)}` : 'Date unknown'}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEdit}
                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
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
