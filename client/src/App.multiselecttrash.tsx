import React, { useState } from 'react';
import MultiSelectMainContent from './components/MultiSelectMainContent';
import { mockTrashedNotes } from './multiSelectMockData';

const App = () => {
  const [notes, setNotes] = useState(mockTrashedNotes);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkDelete = async (noteIds) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNotes(prevNotes => 
      prevNotes.filter(note => !noteIds.includes(note.id))
    );
    setIsLoading(false);
    console.log(`Bulk deleted notes: ${noteIds.join(', ')}`);
  };

  const handleBulkRestore = async (noteIds) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNotes(prevNotes => 
      prevNotes.map(note => 
        noteIds.includes(note.id) 
          ? { ...note, status: 'active' }
          : note
      )
    );
    setIsLoading(false);
    console.log(`Bulk restored notes: ${noteIds.join(', ')}`);
  };

  const handleSingleDelete = async (noteId) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setNotes(prevNotes => 
      prevNotes.filter(note => note.id !== noteId)
    );
    setIsLoading(false);
    console.log(`Permanently deleted note: ${noteId}`);
  };

  const handleSingleRestore = async (noteId) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, status: 'active' }
          : note
      )
    );
    setIsLoading(false);
    console.log(`Restored note: ${noteId}`);
  };

  const handleRefreshNotes = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    console.log('Notes refreshed');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {darkMode ? '☀️' : '🌙'} Toggle Theme
        </button>
      </div>

      <MultiSelectMainContent
        notes={notes}
        darkMode={darkMode}
        onBulkDelete={handleBulkDelete}
        onBulkRestore={handleBulkRestore}
        onSingleDelete={handleSingleDelete}
        onSingleRestore={handleSingleRestore}
        isGridView={true}
        notesLoading={isLoading}
        onRefreshNotes={handleRefreshNotes}
      />

      {/* Demo Instructions */}
      <div className={`fixed bottom-4 left-4 max-w-sm p-4 rounded-lg border ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-200' 
          : 'bg-white border-gray-200 text-gray-900'
      } shadow-lg`}>
        <h3 className="font-semibold mb-2">Multi-Select Demo</h3>
        <ul className="text-sm space-y-1">
          <li>• Click "Select Notes" to enter selection mode</li>
          <li>• Use checkboxes to select individual notes</li>
          <li>• Use "Select All" to select all notes</li>
          <li>• Click "Delete Selected" for bulk deletion</li>
          <li>• Individual restore/delete still available</li>
        </ul>
      </div>
    </div>
  );
};

export default App;