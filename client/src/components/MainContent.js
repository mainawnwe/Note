import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';
import CreateArea from './CreateArea';
import Note from './Note';
import Footer from './Footer';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';

const NOTES_API_ENDPOINT = 'http://localhost:8000';

export default function MainContent({ isGridView, searchTerm, selectedCategory }) {
  const { darkMode } = useTheme();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotes();
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

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      const response = await fetch(NOTES_API_ENDPOINT);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch notes: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      const formattedNotes = data.map(note => ({
        ...note,
        id: note.id.toString()
      }));

      formattedNotes.sort((a, b) => {
        if (a.pinned === b.pinned) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.pinned - a.pinned;
      });

      // Filter notes by selectedCategory if provided
      const filteredNotes = selectedCategory
        ? formattedNotes.filter(note => note.category === selectedCategory)
        : formattedNotes;

      setNotes(filteredNotes);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddNote = async (newNote) => {
    try {
      const payload = {
        title: newNote.title,
        content: newNote.content,
        color: newNote.color || '#ffffff',
        pinned: newNote.pinned || false
      };

      const response = await fetch(NOTES_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add note');
      }

      fetchNotes();
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

  const handleRefresh = () => {
    fetchNotes();
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

      fetchNotes();
    } catch (err) {
      showErrorModal(err.message);
    }
  };

  const handleUpdateNote = async (id, updatedNote) => {
    try {
      const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update note');
      }

      fetchNotes();
    } catch (err) {
      setModalContent({
        title: 'Error',
        message: err.message,
        type: 'error'
      });
      setShowModal(true);
    }
  };

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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center px-3 py-2 rounded-lg transition-all ${darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-amber-400'
                : 'bg-white hover:bg-gray-100 text-blue-600 shadow-sm'
                } ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <CreateArea onAdd={handleAddNote} darkMode={darkMode} />

          {isLoading && (
            <div className={`flex flex-col justify-center items-center h-64 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-amber-500' : 'border-blue-500'}`}></div>
              <p className="mt-4 text-lg">Loading your notes...</p>
              <p className="text-sm opacity-70 mt-1">Hang tight!</p>
            </div>
          )}

          {error && !isLoading && (
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

          {!isLoading && !error && notes.length === 0 && (
            <div className={`text-center py-16 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm transition-all hover:shadow-md`}>
              <Info className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`} />
              <h3 className="text-xl font-medium mb-2">Your notes collection is empty</h3>
              <p className={`max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                Start by adding your first note above. It could be anything - a thought, idea, or reminder!
              </p>
            </div>
          )}

          {!isLoading && notes.length > 0 && (
            <>
              <div className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">{notes.length}</span> {notes.length === 1 ? 'note' : 'notes'}
                {notes.some(n => n.pinned) && (
                  <span className="ml-4">
                    <span className="font-medium">
                      {notes.filter(n => n.pinned).length}
                    </span> pinned
                  </span>
                )}
              </div>

              <div className={isGridView
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "flex flex-col space-y-5"
              }>
                {notes.map(note => (
                  <Note
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    createdAt={note.createdAt}
                    pinned={note.pinned}
                    color={note.color}
                    darkMode={darkMode}
                    onDelete={handleDeleteNote}
                    onUpdate={handleUpdateNote}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {showModal && (
        <Modal
          title={modalContent.title}
          message={modalContent.message}
          type={modalContent.type}
          darkMode={darkMode}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}