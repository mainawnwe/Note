import React, { useState, useEffect } from 'react';
import NoteEditor from './NoteEditor';
import { Plus, Type, List, Image, Edit3, Pin, Trash2, X } from 'lucide-react';

export default function CreateArea({
  onAdd,
  darkMode,
  onLabelsChange,
  currentLabel,
  allLabels,
  setAllLabels,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [noteType, setNoteType] = useState('note');
  const [selectedLabels, setSelectedLabels] = useState([]); // Define selectedLabels
  const [isPinned, setIsPinned] = useState(false);
  const [noteColor, setNoteColor] = useState(darkMode ? '#1f2937' : '#ffffff');
  
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
  }, [isCreating, darkMode]);

  const handleSave = (note) => {
    // Resolve type and labels robustly
    const resolvedType = note?.type || noteType;
    // Normalize incoming labels to IDs (strings)
    const incoming = Array.isArray(note?.labels)
      ? note.labels
          .map((l) => (typeof l === 'object' && l !== null ? String(l.id ?? l.name) : String(l)))
          .filter(Boolean)
      : [];

    const fallbackLabels = currentLabel ? [String(currentLabel.id ?? currentLabel.name)] : [];
    const finalLabels = incoming.length ? incoming : fallbackLabels;

    const correctedNote = {
      ...note,
      type: resolvedType,
      content: note?.content ?? '',
      pinned: isPinned,
      color: note?.color ?? noteColor,
      labels: finalLabels,
    };
    onAdd(correctedNote);
    // Keep modal open; NoteEditor may choose to close by returning true
    return false;
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsPinned(false);
    setNoteColor(darkMode ? '#1f2937' : '#ffffff');
  };

  const handleQuickCreate = (type) => {
    setNoteType(type);
    setIsCreating(true);
    
    // Ensure list items are properly initialized for list notes
    if (type === 'list') {
      // This will be handled by NoteEditor component
    }
  };

  
  const quickActions = [
    { type: 'note', icon: Type, label: 'Text', color: 'bg-blue-500' },
    { type: 'list', icon: List, label: 'List', color: 'bg-green-500' },
    { type: 'image', icon: Image, label: 'Image', color: 'bg-purple-500' },
    { type: 'drawing', icon: Edit3, label: 'Drawing', color: 'bg-orange-500' },
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
            className={`rounded-2xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] m-4 transition-all duration-300 transform scale-100 overflow-visible border ${borderClass}`}
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

                <div className="flex items-center space-x-2 relative z-20">
                  
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
                  initialNote={{
                    type: noteType,
                    labels: selectedLabels, // Use selectedLabels instead
                    pinned: isPinned,
                    color: noteColor,
                    content: ''
                  }}
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
                  onColorChange={(c) => setNoteColor(c)}
                  initialColor={noteColor}
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