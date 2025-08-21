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
  startInCreatingMode = false,
  onClose
}) {
  const [isCreating, setIsCreating] = useState(startInCreatingMode);
  const [noteType, setNoteType] = useState('note');
  const [selectedLabels, setSelectedLabels] = useState([]);
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

    // Ensure content for list notes: prefer plain text, fallback to stripped HTML text
    const ensureContent = () => {
      const raw = note?.content;
      if (typeof raw === 'string' && raw.trim() !== '') return raw;
      if (resolvedType === 'list' && typeof note?.content_html === 'string' && note.content_html.trim() !== '') {
        try {
          const tmp = typeof document !== 'undefined' ? document.createElement('div') : null;
          if (tmp) {
            tmp.innerHTML = note.content_html;
            const txt = (tmp.textContent || tmp.innerText || '').trim();
            return txt;
          }
        } catch (e) {
          // ignore
        }
      }
      return '';
    };

    // Preserve structured fields like listItems/drawing_data/image_url if present
    const correctedNote = {
      ...note,
      type: resolvedType,
      content: ensureContent(),
      content_html: typeof note?.content_html === 'string' ? note.content_html : '',
      pinned: isPinned,
      color: note?.color ?? noteColor,
      labels: finalLabels,
      listItems: Array.isArray(note?.listItems) ? note.listItems : (resolvedType === 'list' ? [] : note?.listItems)
    };

    onAdd(correctedNote);
    // Close modal after saving
    return true;
  };
  
  const handleCancel = () => {
    setIsCreating(false);
    setIsPinned(false);
    setNoteColor(darkMode ? '#1f2937' : '#ffffff');
    if (onClose) {
      onClose();
    }
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
  
  return (
    <div className="my-8 max-w-2xl mx-auto transition-all duration-300">
      {!isCreating && !startInCreatingMode && (
        <div className="space-y-4">
          {/* Main Create Card - Modern Google Keep Style */}
          <div
            className={`relative group cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-sm ${
              darkMode 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/90 border border-teal-200'
            }`}
            onClick={() => setIsCreating(true)}
            style={{ backgroundColor: noteColor }}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className={`text-lg ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  } opacity-80 font-medium`}>
                    Take a note...
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.type}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-teal-100/50'
                      }`}
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
            className={`lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40`}
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
      
      {(isCreating || startInCreatingMode) && (
        <div
          className={`fixed inset-0 ${
            darkMode ? 'bg-gray-900/80' : 'bg-black/60'
          } flex items-center justify-center z-[9999] transition-opacity duration-300 backdrop-blur-sm`}
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`rounded-3xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] m-4 transition-all duration-300 transform scale-100 overflow-hidden ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-teal-200/50'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: noteColor, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
          >
            <div className="relative flex flex-col h-full min-h-0">
              {/* Header */}
              <div className={`flex items-center justify-between p-4 ${
                darkMode 
                  ? 'bg-gray-800 border-b border-gray-700' 
                  : 'bg-white border-b border-teal-200'
              } rounded-t-3xl`}>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isPinned
                        ? 'text-yellow-500 bg-yellow-500/10'
                        : darkMode 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-teal-100/50'
                    }`}
                    title={isPinned ? "Unpin note" : "Pin note"}
                  >
                    <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex items-center space-x-1 overflow-x-auto">
                    {quickActions.map((action) => (
                      <button
                        key={action.type}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                          noteType === action.type
                            ? `${action.color} text-white shadow-md`
                            : darkMode 
                              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' 
                              : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
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
                    className={`p-2 rounded-full transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-teal-100/50'
                    }`}
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Editor Area */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-48" style={{ direction: 'ltr', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 160px)' }}>
                <NoteEditor
                  initialNote={{
                    type: noteType,
                    labels: selectedLabels,
                    pinned: isPinned,
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
              <div className={`absolute inset-x-0 bottom-0 z-50 flex items-center justify-between p-4 min-h-16 ${
                darkMode 
                  ? 'bg-gray-800 border-t border-gray-700' 
                  : 'bg-white border-t border-teal-200'
              } rounded-b-3xl shadow-[0_-6px_12px_rgba(0,0,0,0.08)]`} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                } opacity-70`}>
                  Press Esc to cancel
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                      darkMode
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                        : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
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