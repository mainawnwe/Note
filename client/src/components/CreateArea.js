import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  User,
  Image as ImageIcon,
  Archive,
  MoreHorizontal,
  Tag,
  CheckSquare,
  Copy,
  X,
  Pin,
  ChevronDown,
  Send,
  Bold,
  Italic,
  Underline,
  Type,
  List,
  PenTool,
  Camera
} from 'lucide-react';

export default function CreateArea({ onAdd, darkMode }) {
  const [note, setNote] = useState({
    title: '',
    content: '',
    color: darkMode ? '#1e293b' : '#ffffff',
    pinned: false,
    type: 'note' // 'note', 'list', 'image', 'drawing'
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [listItems, setListItems] = useState([{ id: 1, text: '', checked: false }]);
  const moreOptionsRef = useRef(null);

  // Handle different note types
  const handleNoteTypeChange = (type) => {
    setNote(prev => ({ ...prev, type }));
    setIsExpanded(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote(prevNote => ({ ...prevNote, [name]: value }));
  };

  const toggleFormatting = (type) => {
    setFormatting(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const togglePin = () => {
    setNote(prevNote => ({ ...prevNote, pinned: !prevNote.pinned }));
  };

  const handleColorChange = (color) => {
    setNote(prevNote => ({ ...prevNote, color }));
  };

  // List item management
  const addListItem = () => {
    setListItems([...listItems, { id: Date.now(), text: '', checked: false }]);
  };

  const updateListItem = (id, value) => {
    setListItems(listItems.map(item =>
      item.id === id ? { ...item, text: value } : item
    ));
  };

  const toggleCheckItem = (id) => {
    setListItems(listItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const submitNote = (e) => {
    e.preventDefault();

    // Validate based on note type
    if (note.type === 'note' && note.title.trim() === '' && note.content.trim() === '') return;
    if (note.type === 'list' && listItems.every(item => item.text.trim() === '')) return;

    const noteToAdd = {
      ...note,
      ...(note.type === 'list' && { listItems })
    };

    onAdd(noteToAdd);

    // Reset state
    setNote({
      title: '',
      content: '',
      color: darkMode ? '#1e293b' : '#ffffff',
      pinned: false,
      type: 'note'
    });
    setListItems([{ id: 1, text: '', checked: false }]);
    setIsExpanded(false);
    setMoreOptionsOpen(false);
  };

  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
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

  const colors = [
    { bg: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '#334155' : '#e2e8f0' },
    { bg: '#fecaca', border: '#fca5a5' },
    { bg: '#fed7aa', border: '#fdba74' },
    { bg: '#fef08a', border: '#fde047' },
    { bg: '#d9f99d', border: '#bef264' },
    { bg: '#a7f3d0', border: '#6ee7b7' },
    { bg: '#bae6fd', border: '#7dd3fc' },
    { bg: '#c7d2fe', border: '#a5b4fc' },
    { bg: '#e9d5ff', border: '#d8b4fe' },
  ];

  return (
    <div className="my-8 max-w-2xl mx-auto transition-all duration-300">
      {/* Pre-expand buttons (Google Keep style) */}
      {!isExpanded && (
        <div className={`flex justify-between items-center p-3 rounded-xl shadow-md mb-3 transition-all
          ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <button
            onClick={() => handleNoteTypeChange('note')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
          >
            <Type className="mr-2 h-5 w-5" />
            <span>New Note</span>
          </button>

          <button
            onClick={() => handleNoteTypeChange('list')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
          >
            <List className="mr-2 h-5 w-5" />
            <span>New List</span>
          </button>

          <button
            onClick={() => handleNoteTypeChange('drawing')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
          >
            <PenTool className="mr-2 h-5 w-5" />
            <span>Drawing</span>
          </button>

          <button
            onClick={() => handleNoteTypeChange('image')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
          >
            <Camera className="mr-2 h-5 w-5" />
            <span>Image</span>
          </button>
        </div>
      )}

      <form
        onSubmit={submitNote}
        className={`
          p-4 rounded-xl shadow-xl transition-all duration-300 ease-in-out 
          ${darkMode ? 'border border-gray-700' : 'border border-gray-200'}
          ${isExpanded ? 'scale-100' : 'scale-95 hover:scale-100'}
        `}
        style={{
          backgroundColor: note.color,
          boxShadow: isExpanded ?
            (darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)') : 'none'
        }}
      >
        {isExpanded && (
          <div className="flex justify-between items-center mb-3">
            <input
              name="title"
              onChange={handleChange}
              value={note.title}
              placeholder="Title"
              className={`
                flex-grow p-2 text-xl font-semibold focus:outline-none rounded-lg
                ${formatting.bold ? 'font-bold' : ''} 
                ${formatting.italic ? 'italic' : ''} 
                ${formatting.underline ? 'underline' : ''}
                ${darkMode ? 'bg-gray-800/50 text-white placeholder-gray-400' : 'bg-white/50 text-gray-800 placeholder-gray-500'}
              `}
            />
            <button
              type="button"
              onClick={togglePin}
              className={`
                ml-3 p-2 rounded-full transition-all
                ${note.pinned ? 'text-amber-500 bg-amber-500/10' : 'text-gray-400 hover:bg-gray-200/50'}
                ${darkMode && !note.pinned ? 'hover:bg-gray-700' : ''}
              `}
              aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content area - dynamic based on note type */}
        {note.type === 'note' && (
          <textarea
            name="content"
            onFocus={handleFocus}
            onChange={handleChange}
            value={note.content}
            placeholder={isExpanded ? "Start writing..." : "Take a note..."}
            rows={isExpanded ? 4 : 1}
            className={`
              w-full p-3 focus:outline-none rounded-lg transition-all
              ${formatting.bold ? 'font-bold' : ''} 
              ${formatting.italic ? 'italic' : ''} 
              ${formatting.underline ? 'underline' : ''}
              ${darkMode ? 'bg-gray-800/50 text-white placeholder-gray-400' : 'bg-white/50 text-gray-800 placeholder-gray-500'}
            `}
          />
        )}

        {note.type === 'list' && (
          <div className="space-y-2 py-2">
            {listItems.map((item) => (
              <div key={item.id} className="flex items-start">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheckItem(item.id)}
                  className={`
                    mt-1.5 mr-2 h-5 w-5 rounded 
                    ${darkMode ? 'text-blue-400 bg-gray-700 border-gray-600' : 'text-blue-500 border-gray-300'}
                  `}
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateListItem(item.id, e.target.value)}
                  placeholder="List item"
                  className={`
                    flex-grow p-2 focus:outline-none rounded-lg
                    ${item.checked ? 'line-through text-gray-500' : ''}
                    ${darkMode ? 'bg-gray-800/50 text-white' : 'bg-white/50 text-gray-800'}
                  `}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addListItem}
              className={`
                mt-2 px-4 py-2 rounded-lg flex items-center
                ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}
              `}
            >
              <span>+ Add item</span>
            </button>
          </div>
        )}

        {note.type === 'drawing' && (
          <div className="space-y-4">
            <div className={`
              h-40 rounded-lg border-2 border-dashed flex items-center justify-center
              ${darkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white/50 border-gray-300'}
            `}>
              <button
                type="button"
                className={`
                  px-4 py-2 rounded-lg flex items-center
                  ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                `}
              >
                <PenTool className="mr-2 h-5 w-5" />
                <span>Start drawing</span>
              </button>
            </div>
            <textarea
              name="content"
              onChange={handleChange}
              value={note.content}
              placeholder="Add a description..."
              rows={2}
              className={`
                w-full p-3 focus:outline-none rounded-lg
                ${darkMode ? 'bg-gray-800/50 text-white' : 'bg-white/50 text-gray-800'}
              `}
            />
          </div>
        )}

        {note.type === 'image' && (
          <div className="space-y-4">
            <div className={`
              h-40 rounded-lg border-2 border-dashed flex items-center justify-center
              ${darkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white/50 border-gray-300'}
            `}>
              <button
                type="button"
                className={`
                  px-4 py-2 rounded-lg flex items-center
                  ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                `}
              >
                <Camera className="mr-2 h-5 w-5" />
                <span>Upload image</span>
              </button>
            </div>
            <textarea
              name="content"
              onChange={handleChange}
              value={note.content}
              placeholder="Add a description..."
              rows={2}
              className={`
                w-full p-3 focus:outline-none rounded-lg
                ${darkMode ? 'bg-gray-800/50 text-white' : 'bg-white/50 text-gray-800'}
              `}
            />
          </div>
        )}

        {isExpanded && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {colors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColorChange(color.bg)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-transform
                    ${note.color === color.bg ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : 'scale-100 hover:scale-110'}
                  `}
                  style={{
                    backgroundColor: color.bg,
                    borderColor: color.border
                  }}
                  aria-label={`Select color ${color.bg}`}
                />
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
              <div className="flex space-x-2">
                {/* Formatting buttons */}
                <button
                  type="button"
                  onClick={() => toggleFormatting('bold')}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${formatting.bold ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500 hover:bg-gray-200/50'}
                    ${darkMode && !formatting.bold ? 'hover:bg-gray-700' : ''}
                  `}
                  aria-label="Bold"
                >
                  <Bold className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFormatting('italic')}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${formatting.italic ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500 hover:bg-gray-200/50'}
                    ${darkMode && !formatting.italic ? 'hover:bg-gray-700' : ''}
                  `}
                  aria-label="Italic"
                >
                  <Italic className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFormatting('underline')}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${formatting.underline ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500 hover:bg-gray-200/50'}
                    ${darkMode && !formatting.underline ? 'hover:bg-gray-700' : ''}
                  `}
                  aria-label="Underline"
                >
                  <Underline className="h-5 w-5" />
                </button>

                {/* More options dropdown */}
                <div className="relative" ref={moreOptionsRef}>
                  <button
                    type="button"
                    onClick={toggleMoreOptions}
                    className={`
                      p-2 rounded-lg flex items-center transition-colors
                      ${moreOptionsOpen ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500 hover:bg-gray-200/50'}
                      ${darkMode && !moreOptionsOpen ? 'hover:bg-gray-700' : ''}
                    `}
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${moreOptionsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {moreOptionsOpen && (
                    <div className={`
                      absolute bottom-full mb-2 left-0 w-56 bg-white rounded-lg shadow-lg z-50
                      ${darkMode ? 'bg-gray-800 border border-gray-700' : 'border border-gray-200'}
                    `}>
                      <button
                        type="button"
                        className={`
                          w-full text-left px-4 py-2 flex items-center hover:bg-gray-100
                          ${darkMode ? 'hover:bg-gray-700' : ''}
                        `}
                        onClick={() => alert('Reminder')}
                      >
                        <Clock className="mr-3 h-5 w-5 text-gray-500" />
                        <span>Reminder</span>
                      </button>
                      <button
                        type="button"
                        className={`
                          w-full text-left px-4 py-2 flex items-center hover:bg-gray-100
                          ${darkMode ? 'hover:bg-gray-700' : ''}
                        `}
                        onClick={() => alert('Collaborator')}
                      >
                        <User className="mr-3 h-5 w-5 text-gray-500" />
                        <span>Collaborator</span>
                      </button>
                      <button
                        type="button"
                        className={`
                          w-full text-left px-4 py-2 flex items-center hover:bg-gray-100
                          ${darkMode ? 'hover:bg-gray-700' : ''}
                        `}
                        onClick={() => alert('Add Image')}
                      >
                        <ImageIcon className="mr-3 h-5 w-5 text-gray-500" />
                        <span>Add Image</span>
                      </button>
                      <button
                        type="button"
                        className={`
                          w-full text-left px-4 py-2 flex items-center hover:bg-gray-100
                          ${darkMode ? 'hover:bg-gray-700' : ''}
                        `}
                        onClick={() => alert('Add Checkbox')}
                      >
                        <CheckSquare className="mr-3 h-5 w-5 text-gray-500" />
                        <span>Add Checkbox</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className={`
                    p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-200/50
                    ${darkMode ? 'hover:bg-gray-700' : ''}
                  `}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={note.type === 'note' ? (!note.title && !note.content) :
                    note.type === 'list' ? listItems.every(item => item.text.trim() === '') : false}
                  className={`
                    px-4 py-2 rounded-lg flex items-center space-x-2 transition-all
                    ${(note.type === 'note' && (note.title || note.content)) ||
                      (note.type === 'list' && !listItems.every(item => item.text.trim() === '')) ?
                      'bg-blue-500 hover:bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    ${darkMode && !(note.title || note.content) ? 'bg-gray-700' : ''}
                  `}
                  aria-label="Add note"
                >
                  <Send className="h-5 w-5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}