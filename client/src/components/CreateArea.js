import React, { useState } from 'react';
import NoteEditor from './NoteEditor';

export default function CreateArea({
  onAdd,
  darkMode,
  onLabelsChange,
  currentLabel,
  allLabels,
  setAllLabels,
  setShowNoteModal,
  setCurrentNote
}) {
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (note) => {
    onAdd(note);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  return (
    <div className="my-8 max-w-2xl mx-auto transition-all duration-300">
      {!isCreating && (
        <div
          className={`flex justify-between items-center p-3 rounded-xl shadow-md mb-3 transition-all
            ${darkMode ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-700'}`}
          onClick={() => setIsCreating(true)}
        >
          <input
            placeholder="Take a note..."
            className={`flex-grow py-3 px-2 focus:outline-none bg-transparent cursor-text
              ${darkMode ? 'text-gray-300 placeholder-gray-400' : 'text-gray-600 placeholder-gray-500'}`}
            readOnly
          />
        </div>
      )}

      {isCreating && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancel}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-full overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <NoteEditor
              initialNote={null}
              onSave={handleSave}
              onCancel={handleCancel}
              darkMode={darkMode}
              onLabelsChange={onLabelsChange}
              currentLabel={currentLabel}
              allLabels={allLabels}
              setAllLabels={setAllLabels}
            />
          </div>
        </div>
      )}
    </div>
  );
}
