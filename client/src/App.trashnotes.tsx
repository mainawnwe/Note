import React, { useState } from 'react';
import TrashNoteCard from './components/TrashNoteCard';
import PermanentDeleteConfirmation from './components/PermanentDeleteConfirmation';

// Mock data for demonstration
const mockTrashedNotes = [
  {
    id: 1,
    title: "Meeting Notes",
    content: "Discussed project timeline and deliverables for Q1 2024",
    type: "note",
    color: "#fef08a",
    createdAt: "2024-01-15T10:30:00Z",
    status: "trashed",
    pinned: false,
    labels: [{ id: 1, name: "Work", color: "#3b82f6" }]
  },
  {
    id: 2,
    title: "Shopping List",
    content: "",
    type: "list",
    color: "#d9f99d",
    createdAt: "2024-01-14T15:20:00Z",
    status: "trashed",
    pinned: false,
    listItems: [
      { id: 1, text: "Milk", checked: false },
      { id: 2, text: "Bread", checked: true },
      { id: 3, text: "Eggs", checked: false }
    ],
    labels: [{ id: 2, name: "Personal", color: "#10b981" }]
  },
  {
    id: 3,
    title: "Recipe Ideas",
    content: "Collection of healthy dinner recipes to try this week",
    type: "note",
    color: "#fecaca",
    createdAt: "2024-01-13T09:15:00Z",
    status: "trashed",
    pinned: true,
    labels: [{ id: 3, name: "Cooking", color: "#f59e0b" }]
  }
];

const App = () => {
  const [notes, setNotes] = useState(mockTrashedNotes);
  const [darkMode, setDarkMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const handleRestore = (noteId) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, status: 'active' }
          : note
      )
    );
    console.log(`Note ${noteId} restored`);
  };

  const handlePermanentDelete = (noteId) => {
    setNotes(prevNotes => 
      prevNotes.filter(note => note.id !== noteId)
    );
    console.log(`Note ${noteId} permanently deleted`);
  };

  const handleShowConfirmation = (note) => {
    setSelectedNote(note);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (selectedNote) {
      handlePermanentDelete(selectedNote.id);
    }
    setShowConfirmation(false);
    setSelectedNote(null);
  };

  const trashedNotes = notes.filter(note => note.status === 'trashed');

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-200 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Trash Notes Demo
          </h1>
          <p className={`text-lg mb-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Hover over notes to see restore and permanent delete actions
          </p>
          
          {/* Theme Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Toggle {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          <p className={`text-sm ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {trashedNotes.length} notes in trash
          </p>
        </div>

        {/* Notes Grid */}
        {trashedNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trashedNotes.map(note => (
              <TrashNoteCard
                key={note.id}
                note={note}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
                darkMode={darkMode}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <h3 className="text-xl font-semibold mb-2">Trash is empty</h3>
            <p className="text-sm">Deleted notes will appear here</p>
          </div>
        )}

        {/* Standalone Confirmation Dialog Demo */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className={`text-2xl font-bold mb-4 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Confirmation Dialog Demo
          </h2>
          <button
            onClick={() => handleShowConfirmation(mockTrashedNotes[0])}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Show Delete Confirmation
          </button>
        </div>
      </div>

      <PermanentDeleteConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        noteTitle={selectedNote?.title || "Sample Note"}
        darkMode={darkMode}
      />
    </div>
  );
};

export default App;