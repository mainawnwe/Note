import React, { useState, useRef, useEffect } from 'react';
import { Clock, User, Image, Archive, MoreHorizontal, Tag, CheckSquare, Copy, X, Edit3, Undo, Redo, Type, TypeH1, TypeH2, Bold, Italic, Underline, Slash } from 'lucide-react';

export default function CreateArea({ onAdd }) {
  const [note, setNote] = useState({ title: '', content: '', color: '#ffffff', pinned: false });
  const [isExpanded, setIsExpanded] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [formatting, setFormatting] = useState({
    heading1: false,
    heading2: false,
    normal: true,
    bold: false,
    italic: false,
    underline: false,
  });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const moreOptionsRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    saveUndo();
    setNote(prevNote => ({ ...prevNote, [name]: value }));
  };

  const saveUndo = () => {
    setUndoStack(prev => [...prev, note]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack(prevRedo => [...prevRedo, note]);
    setNote(prev);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack(prevUndo => [...prevUndo, note]);
    setNote(next);
  };

  const toggleFormatting = (type) => {
    setFormatting(prev => {
      const newFormatting = { ...prev };
      if (type === 'heading1') {
        newFormatting.heading1 = !prev.heading1;
        if (newFormatting.heading1) {
          newFormatting.heading2 = false;
          newFormatting.normal = false;
        } else {
          newFormatting.normal = true;
        }
      } else if (type === 'heading2') {
        newFormatting.heading2 = !prev.heading2;
        if (newFormatting.heading2) {
          newFormatting.heading1 = false;
          newFormatting.normal = false;
        } else {
          newFormatting.normal = true;
        }
      } else if (type === 'normal') {
        newFormatting.normal = true;
        newFormatting.heading1 = false;
        newFormatting.heading2 = false;
      } else {
        newFormatting[type] = !prev[type];
      }
      return newFormatting;
    });
  };

  const togglePin = () => {
    setNote(prevNote => ({ ...prevNote, pinned: !prevNote.pinned }));
  };

  const handleColorChange = (color) => {
    setNote(prevNote => ({ ...prevNote, color }));
  };

  const submitNote = (e) => {
    e.preventDefault();
    if (note.title.trim() === '' && note.content.trim() === '') return;
    onAdd({ ...note });
    setNote({ title: '', content: '', color: '#ffffff', pinned: false });
    setIsExpanded(false);
    setMoreOptionsOpen(false);
    setFormatting({
      heading1: false,
      heading2: false,
      normal: true,
      bold: false,
      italic: false,
      underline: false,
    });
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const toggleMoreOptions = () => {
    setMoreOptionsOpen(!moreOptionsOpen);
  };

  const closeMoreOptions = (e) => {
    if (moreOptionsRef.current && !moreOptionsRef.current.contains(e.target)) {
      setMoreOptionsOpen(false);
    }
  };

  useEffect(() => {
    if (moreOptionsOpen) {
      document.addEventListener('mousedown', closeMoreOptions);
    } else {
      document.removeEventListener('mousedown', closeMoreOptions);
    }
    return () => {
      document.removeEventListener('mousedown', closeMoreOptions);
    };
  }, [moreOptionsOpen]);

  const colors = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb'];

  return (
    <div className="my-6 max-w-xl mx-auto">
      <form onSubmit={submitNote} className="bg-white p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out" style={{ backgroundColor: note.color }}>
        {isExpanded && (
          <div className="flex justify-between items-center mb-2">
            <input
              name="title"
              onChange={handleChange}
              value={note.title}
              placeholder="Title"
              className={`flex-grow p-2 text-lg font-semibold border-b border-slate-300 focus:outline-none focus:border-amber-500 transition-colors ${
                formatting.bold ? 'font-bold' : ''
              } ${formatting.italic ? 'italic' : ''} ${formatting.underline ? 'underline' : ''}`}
              style={{
                fontSize: formatting.heading1 ? '1.5rem' : formatting.heading2 ? '1.25rem' : '1.125rem',
              }}
            />
            <button
              type="button"
              aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              onClick={togglePin}
              className="ml-2 p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${note.pinned ? 'text-yellow-500' : 'text-gray-400'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="none"
              >
                <path d="M12 2C10.895 2 10 2.895 10 4v5H7v2h3v5c0 1.105.895 2 2 2s2-.895 2-2v-5h3v-2h-3V4c0-1.105-.895-2-2-2z" />
              </svg>
            </button>
          </div>
        )}
        <textarea
          name="content"
          onFocus={handleFocus}
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
          className={`w-full p-2 text-slate-700 border-b border-slate-300 focus:outline-none focus:border-amber-500 resize-none transition-all duration-200 ${
            formatting.bold ? 'font-bold' : ''
          } ${formatting.italic ? 'italic' : ''} ${formatting.underline ? 'underline' : ''}`}
          style={{
            fontSize: formatting.heading1 ? '1.25rem' : formatting.heading2 ? '1.125rem' : '1rem',
          }}
          required={!note.title && isExpanded}
        />
        {isExpanded && (
          <>
            <div className="flex space-x-2 my-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 ${note.color === color ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 items-center">
              <div className="flex space-x-3">
                <button
                  type="button"
                  aria-label="Reminder"
                  className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onClick={() => alert('Reminder clicked - implement feature')}
                >
                  <Clock className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  aria-label="Collaborator"
                  className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onClick={() => alert('Collaborator clicked - implement feature')}
                >
                  <User className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  aria-label="Add Image"
                  className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onClick={() => alert('Add Image clicked - implement feature')}
                >
                  <Image className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  aria-label="Archive"
                  className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onClick={() => alert('Archive clicked - implement feature')}
                >
                  <Archive className="h-5 w-5 text-gray-600" />
                </button>
                <div className="relative" ref={moreOptionsRef}>
                  <button
                    type="button"
                    aria-label="More options"
                    className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onClick={toggleMoreOptions}
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                  </button>
                  {moreOptionsOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                        onClick={() => alert('Add Label clicked - implement feature')}
                      >
                        <Tag className="inline-block mr-2 h-5 w-5 text-gray-600" />
                        Add Label
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                        onClick={() => alert('Add Drawing clicked - implement feature')}
                      >
                        <svg className="inline-block mr-2 h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                        Add Drawing
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                        onClick={() => alert('Add Checkbox clicked - implement feature')}
                      >
                        <CheckSquare className="inline-block mr-2 h-5 w-5 text-gray-600" />
                        Add Checkbox
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                        onClick={() => alert('Make a Copy clicked - implement feature')}
                      >
                        <Copy className="inline-block mr-2 h-5 w-5 text-gray-600" />
                        Make a Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Close note input"
                className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onClick={() => {
                  setIsExpanded(false);
                  setMoreOptionsOpen(false);
                }}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-5 rounded-md shadow-md transition-colors duration-150 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                  <path d="M12 2C10.895 2 10 2.895 10 4v5H7v2h3v5c0 1.105.895 2 2 2s2-.895 2-2v-5h3v-2h-3V4c0-1.105-.895-2-2-2z" />
                </svg>
                Add
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
