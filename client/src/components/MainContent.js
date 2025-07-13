import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';
import CreateArea from './CreateArea';
import Note from './Note';
import Footer from './Footer';
import Modal from './Modal';
import NoteDetailsModal from './NoteDetailsModal';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';

const NOTES_API_ENDPOINT = 'http://localhost:8000/index.php';

export default function MainContent({
  isGridView,
  searchTerm,
  selectedCategory,
  selectedType,
  onBack,
  onClose,
  onLabelClick,
  allLabels,
  setAllLabels,
  onRefreshNotes,
  notesLoading,
  notes,
  setNotes
}) {
  const { darkMode } = useTheme();

  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [retryCount, setRetryCount] = useState(0);

  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteDetailsOpen, setIsNoteDetailsOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(null);

  // Remove isRefreshing and isLoading states as they are replaced by notesLoading prop

  // Sync currentLabel with selectedCategory and allLabels
  useEffect(() => {
    if (selectedCategory && allLabels && allLabels.length > 0) {
      const normalizedCategory = selectedCategory.trim().toLowerCase();
      const matchedLabel = allLabels.find(label => label.name.trim().toLowerCase() === normalizedCategory);
      if (matchedLabel) {
        setCurrentLabel(prevLabel => {
          if (!prevLabel || String(prevLabel.id) !== String(matchedLabel.id)) {
            return matchedLabel;
          }
          return prevLabel;
        });
      } else {
        setCurrentLabel(prevLabel => {
          if (prevLabel !== null) {
            return null;
          }
          return prevLabel;
        });
      }
    } else {
      setCurrentLabel(prevLabel => {
        if (prevLabel !== null) {
          return null;
        }
        return prevLabel;
      });
    }
  }, [selectedCategory, allLabels]);

  useEffect(() => {
    // Removed automatic refresh on selectedCategory, searchTerm, currentLabel changes
    // Notes will refresh only on explicit refresh button clicks
  }, []);

  useEffect(() => {
    if (showModal && modalContent.type === 'success') {
      const timeout = setTimeout(() => setShowModal(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showModal, modalContent]);

  const showErrorModal = (message) => {
    setModalContent({
      title: 'Error',
      message,
      type: 'error'
    });
    setShowModal(true);
  };

  const handleLabelClick = (label) => {
    setCurrentLabel(label);
  };

  const handleAddNote = async (newNote) => {
    try {
      const payload = {
        title: newNote.title,
        content: newNote.content,
        type: newNote.type,
        color: newNote.color || '#ffffff',
        pinned: newNote.pinned || false,
        listItems: newNote.type === 'list' ? newNote.listItems : null,
        drawing_data: newNote.type === 'drawing' ? newNote.drawingData : null,
        image_url: newNote.type === 'image' ? newNote.imageData : null,
        category: newNote.category || null,
        labels: newNote.labels || []
      };

      console.log('Sending note payload:', payload);

      const response = await fetch(NOTES_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add note');
      }

      console.log('Note added successfully, refreshing notes...');
      await onRefreshNotes();
      setModalContent({
        title: 'Note Added',
        message: 'Your note has been saved successfully',
        type: 'success'
      });
      setShowModal(true);
    } catch (err) {
      setModalContent({
        title: 'Error',
        message: err.message,
        type: 'error'
      });
      setShowModal(true);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note');
      }

      await onRefreshNotes();
    } catch (err) {
      showErrorModal(err.message);
    }
  };

  const handleUpdateNote = async (id, updatedNote) => {
    try {
      // Preserve labels if missing or empty in updatedNote
      if (!updatedNote.labels || updatedNote.labels.length === 0) {
        const existingNote = notes.find(note => note.id === id);
        if (existingNote && existingNote.labels) {
          updatedNote.labels = existingNote.labels;
        }
      } else {
        // Convert label IDs to full label objects using allLabels
        if (Array.isArray(updatedNote.labels) && allLabels && allLabels.length > 0) {
          const labelObjects = updatedNote.labels.map(labelId => {
            if (typeof labelId === 'object' && labelId !== null && labelId.id) {
              return labelId; // already an object
            }
            return allLabels.find(label => String(label.id) === String(labelId));
          }).filter(label => label !== undefined);
          updatedNote.labels = labelObjects;
        }
      }

      // Convert labels from objects to array of IDs before sending to backend
      if (Array.isArray(updatedNote.labels)) {
        updatedNote.labels = updatedNote.labels.map(label => {
          if (typeof label === 'object' && label !== null && label.id) {
            return label.id;
          }
          return label;
        });
      }

      console.log('Updating note with labels (IDs):', updatedNote.labels);
      const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update note');
      }

      await onRefreshNotes();

      // After fetching notes, ensure currentLabel is still set to trigger filtering
      setCurrentLabel(prevLabel => {
        if (prevLabel) {
          return { ...prevLabel };
        }
        return prevLabel;
      });

      console.log('Notes after update:', notes);
    } catch (err) {
      setModalContent({
        title: 'Error',
        message: err.message,
        type: 'error'
      });
      setShowModal(true);
    }
  };

  const openNoteDetails = (note) => {
    setSelectedNote(note);
    setIsNoteDetailsOpen(true);
  };

  const closeNoteDetails = () => {
    setSelectedNote(null);
    setIsNoteDetailsOpen(false);
  };

  // Client-side filter notes by selected type or label
  const filteredNotes = (() => {
    if (selectedCategory) {
      let normalizedCategory = selectedCategory.trim().toLowerCase();
      // Convert plural to singular by removing trailing 's' if present
      if (normalizedCategory.endsWith('s')) {
        normalizedCategory = normalizedCategory.slice(0, -1);
      }
      const noteTypes = ['list', 'image', 'drawing', 'note']; // Add other note types as needed
      if (noteTypes.includes(normalizedCategory)) {
        return notes.filter(note => note.type === normalizedCategory);
      }
    }
    if (selectedType) {
      return notes.filter(note => note.type === selectedType);
    }
    if (selectedCategory && allLabels.some(label => label.name.toLowerCase() === selectedCategory.toLowerCase())) {
      return notes.filter(note => note.labels.some(label => label.name.toLowerCase() === selectedCategory.toLowerCase()));
    }
    return notes;
  })();

  return (
    <div className={`flex flex-col min-h-screen ${darkMode
      ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100'
      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800'
      } font-sans transition-all duration-300`}>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-blue-600'}`}>
              My Notes
            </h1>
            <button
              onClick={onRefreshNotes}
              disabled={notesLoading}
              className={`flex items-center px-3 py-2 rounded-lg transition-all ${darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-amber-400'
                : 'bg-white hover:bg-gray-100 text-blue-600 shadow-sm'
                } ${notesLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${notesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {selectedCategory && (
            <div className="mb-6 p-4 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-between max-w-6xl mx-auto">
              <div>
                <h2 className="text-lg font-semibold">{selectedCategory}</h2>
                <p className="text-sm opacity-70">Showing notes filtered by this category.</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onBack}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  &larr; Back
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  &times; Close
                </button>
              </div>
            </div>
          )}

          {console.log('MainContent currentLabel before CreateArea:', currentLabel)}
          <CreateArea onAdd={handleAddNote} darkMode={darkMode} onLabelClick={onLabelClick} currentLabel={currentLabel} allLabels={allLabels} setAllLabels={setAllLabels} />

          {notesLoading && (
            <div className={`flex flex-col justify-center items-center h-64 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-amber-500' : 'border-blue-500'}`}></div>
              <p className="mt-4 text-lg">Loading your notes...</p>
              <p className="text-sm opacity-70 mt-1">Hang tight!</p>
            </div>
          )}
          {error && !notesLoading && (
            <div className={`${darkMode
              ? 'bg-[#41331C] border-amber-700 text-amber-200'
              : 'bg-red-100 border-red-500 text-red-700'
              } border-l-4 p-4 rounded-lg shadow-lg mb-8 transition-all hover:scale-[1.01]`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className={`h-6 w-6 ${darkMode ? 'text-amber-500' : 'text-red-500'}`} />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold">Connection Error</h3>
                  <p className="text-sm">{error}</p>
                  <div className={`mt-3 p-3 rounded-md ${darkMode ? 'bg-amber-900/30' : 'bg-red-50'}`}>
                    <p className={`text-xs ${darkMode ? 'text-amber-300' : 'text-red-600'}`}>
                      This app expects a PHP backend at <code className="font-mono bg-black/20 px-1.5 py-0.5 rounded">{NOTES_API_ENDPOINT}</code>.
                      Ensure it's running and configured to handle GET, POST, PUT, and DELETE requests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!notesLoading && !error && filteredNotes.length === 0 && (
            <div className={`text-center py-16 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm transition-all hover:shadow-md`}>
              <Info className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`} />
              <h3 className="text-xl font-medium mb-2">Your notes collection is empty</h3>
              <p className={`max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {selectedCategory ? 'No notes found for this category.' : 'Start by adding your first note above. It could be anything - a thought, idea, or reminder!'}
              </p>
            </div>
          )}

          {!notesLoading && filteredNotes.length > 0 && (
            <>
              <div className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">{filteredNotes.length}</span> {filteredNotes.length === 1 ? 'note' : 'notes'}
                {filteredNotes.some(n => n.pinned) && (
                  <span className="ml-4">
                    <span className="font-medium">
                      {filteredNotes.filter(n => n.pinned).length}
                    </span> pinned
                  </span>
                )}
              </div>

              <div className={isGridView
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "flex flex-col space-y-3 max-w-3xl mx-auto"
              }>
          {filteredNotes.map(note => {
            console.log('Rendering Note:', note);
            return (
              <Note
                key={note.id}
                id={note.id}
                title={note.title}
                content={note.content}
                createdAt={note.createdAt}
                pinned={note.pinned}
                color={note.color}
                darkMode={darkMode}
                type={note.type}
                drawingData={note.drawing_data}
                imageData={note.image_url}
                listItems={note.listItems}
                labels={note.labels}
                isGridView={isGridView}
                onDelete={handleDeleteNote}
                onUpdate={handleUpdateNote}
                searchTerm={searchTerm}
                onClick={() => openNoteDetails(note)}
              />
            );
          })}
        </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
