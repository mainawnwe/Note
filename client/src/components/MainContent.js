import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import CreateArea from './CreateArea';
import Note from './Note';
import Footer from './Footer';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';

// Fixed endpoint - now points to root
const NOTES_API_ENDPOINT = 'http://localhost:8000';

export default function MainContent({ isGridView }) {
  const { darkMode } = useTheme();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});

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
      const response = await fetch(NOTES_API_ENDPOINT);

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch notes: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Data:', data);

      // Ensure proper ID formatting
      const formattedNotes = data.map(note => ({
        ...note,
        id: note.id.toString()
      }));

      // Sort notes: pinned notes first
      formattedNotes.sort((a, b) => {
        if (a.pinned === b.pinned) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.pinned - a.pinned;
      });

      setNotes(formattedNotes);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
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
    <>
      <div className={`flex flex-col min-h-screen ${darkMode
          ? 'bg-[#202124] text-gray-100'
          : 'bg-[#fff] text-gray-800'
        } font-sans transition-colors duration-200`}>
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <CreateArea onAdd={handleAddNote} darkMode={darkMode} />

          {/* Removed toggle button since view toggle is handled in Header */}

          {isLoading && (
            <div className={`flex justify-center items-center h-40 ${darkMode ? 'text-gray-400' : 'text-slate-600'
              }`}>
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-amber-500' : 'border-blue-500'
                }`}></div>
              <p className="ml-3">Loading notes...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className={`${darkMode
                ? 'bg-[#41331C] border-amber-700 text-amber-200'
                : 'bg-red-100 border-red-500 text-red-700'
              } border-l-4 p-4 rounded-md shadow-md mb-6`} role="alert">
              <div className="flex">
                <div className="py-1">
                  <AlertTriangle className={`h-6 w-6 ${darkMode ? 'text-amber-500' : 'text-red-500'
                    } mr-3`} />
                </div>
                <div>
                  <p className="font-bold">An Error Occurred</p>
                  <p className="text-sm">{error}</p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-amber-300' : 'text-red-600'
                    }`}>
                    This app expects a PHP backend at <code>{NOTES_API_ENDPOINT}</code>.
                    Ensure it's running and configured to handle GET, POST, PUT, and DELETE requests.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && notes.length === 0 && (
            <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
              <Info className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-slate-400'
                }`} />
              <p className="text-xl">No notes yet.</p>
              <p>Start by adding a new note above!</p>
            </div>
          )}

          <div className={isGridView
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "flex flex-col space-y-4"
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
    </>
  );
}
