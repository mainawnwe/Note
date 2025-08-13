import React, { useState, useEffect, useRef } from 'react';
import NoteEditor from './NoteEditor';
import { Plus, Type, List, Image, Edit3, Pin, Palette, Trash2, X } from 'lucide-react';

export default function CreateArea({
  onAdd,
  darkMode,
  onLabelsChange,
  currentLabel,
  allLabels,
  setAllLabels,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [noteType, setNoteType] = useState('text');
  const [isPinned, setIsPinned] = useState(false);
  const [noteColor, setNoteColor] = useState(darkMode ? '#1f2937' : '#ffffff');
  const createButtonRef = useRef(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isCreating) {
        handleCancel();
      }
    };
    const handleKeyboardShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'n' && !isCreating) {
        event.preventDefault();
        setIsCreating(true);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    window.addEventListener('keydown', handleKeyboardShortcut);

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      window.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [isCreating]);

  const handleSave = (note) => {
    // Ensure note content is properly formatted without reversing
    if (note && note.content && typeof note.content === 'string') {
      // Create a new note object to avoid mutating the original
      const correctedNote = {
        ...note,
        content: note.content, // Pass through content without transformation
        pinned: isPinned,
        color: noteColor
      };
      onAdd(correctedNote);
    } else {
      onAdd(note);
    }
    // Don't close the modal automatically after save
    return false; // Indicate that the modal should not be closed
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsPinned(false);
    setNoteColor(darkMode ? '#1f2937' : '#ffffff');
  };

  const handleQuickCreate = (type) => {
    setNoteType(type);
    setIsCreating(true);
  };

  const quickActions = [
    { type: 'text', icon: Type, label: 'Text', color: 'bg-blue-500' },
    { type: 'list', icon: List, label: 'List', color: 'bg-green-500' },
    { type: 'image', icon: Image, label: 'Image', color: 'bg-purple-500' },
    { type: 'drawing', icon: Edit3, label: 'Drawing', color: 'bg-orange-500' },
  ];

  const colorOptions = [
    { name: 'default', value: darkMode ? '#1f2937' : '#ffffff' },
    { name: 'red', value: '#f8d7da' },
    { name: 'orange', value: '#fff3cd' },
    { name: 'yellow', value: '#fef9c3' },
    { name: 'green', value: '#d1e7dd' },
    { name: 'teal', value: '#cff4fc' },
    { name: 'blue', value: '#cfe2ff' },
    { name: 'purple', value: '#e9d5ff' },
    { name: 'pink', value: '#f9d6e5' },
  ];

  // Base classes for dark/light mode
  const bgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-gray-200' : 'text-gray-700';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const buttonHoverClass = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  return (
    <div className="my-8 max-w-2xl mx-auto transition-all duration-300">
      {!isCreating && (
        <div className="space-y-4">
          {/* Main Create Card - Modern Google Keep Style */}
          <div
            className={`relative group cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${bgClass} overflow-hidden border ${borderClass}`}
            onClick={() => setIsCreating(true)}
            ref={createButtonRef}
            style={{ backgroundColor: noteColor }}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className={`text-lg ${textClass} opacity-80 font-medium`}>
                    Take a note...
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.type}
                      className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} transition-all duration-200`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickCreate(action.type);
                      }}
                      title={`Create ${action.label} note`}
                    >
                      <action.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Button (Mobile) */}
          <button
            className={`lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40`}
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {isCreating && (
        <div
          className={`fixed inset-0 ${darkMode ? 'bg-black/70' : 'bg-black/40'} flex items-center justify-center z-50 transition-opacity duration-300 backdrop-blur-sm`}
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`rounded-2xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] m-4 transition-all duration-300 transform scale-100 overflow-hidden border ${borderClass}`}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: noteColor }}
          >
            <div className="relative flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm border-b ${borderClass}`}>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-2 rounded-full transition-all duration-200 ${isPinned
                        ? 'text-yellow-500 bg-yellow-500/10'
                        : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    title={isPinned ? "Unpin note" : "Pin note"}
                  >
                    <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
                  </button>

                  <div className="flex items-center space-x-1 overflow-x-auto">
                    {quickActions.map((action) => (
                      <button
                        key={action.type}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-200 ${noteType === action.type
                            ? `${action.color} text-white shadow-md`
                            : `${buttonHoverClass} ${textClass}`
                          }`}
                        onClick={() => setNoteType(action.type)}
                        title={`Create ${action.label} note`}
                      >
                        <action.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative group">
                    <button
                      className={`p-2 rounded-full transition-all duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      title="Change color"
                    >
                      <Palette className="w-5 h-5" />
                    </button>

                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3 z-10 border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-3 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.name}
                            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 transition-transform hover:scale-110"
                            style={{ backgroundColor: color.value }}
                            onClick={() => setNoteColor(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCancel}
                    className={`p-2 rounded-full transition-all duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-grow overflow-y-auto p-6" style={{ direction: 'ltr' }}>
                <NoteEditor
                  initialNote={null}
                  onSave={(note) => {
                    const shouldClose = handleSave(note);
                    if (shouldClose) {
                      handleCancel();
                    }
                  }}
                  onCancel={handleCancel}
                  darkMode={darkMode}
                  isModal={true}
                  onLabelsChange={onLabelsChange}
                  currentLabel={currentLabel}
                  allLabels={allLabels}
                  setAllLabels={setAllLabels}
                  noteType={noteType}
                />
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm border-t ${borderClass}`}>
                <p className={`text-sm ${textClass} opacity-70`}>
                  Press Esc to cancel
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Discard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}