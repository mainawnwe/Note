import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import CreateArea from './CreateArea';
import Note from './Note';
import Footer from './Footer';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';

const NOTES_API_ENDPOINT = process.env.REACT_APP_NOTES_API || 'http://localhost:8888/notes';

export default function MainContent() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [isGridView, setIsGridView] = useState(true);
  const { darkMode } = useTheme();  // Get theme context

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(NOTES_API_ENDPOINT);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (newNote) => {
    try {
      const response = await fetch(NOTES_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
      
      if (!response.ok) throw new Error('Failed to add note');
      fetchNotes();
      
      // Show success modal
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
      const response = await fetch(`${NOTES_API_ENDPOINT}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
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

  const handleUpdateNote = async (id, updatedNote) => {
    try {
      const response = await fetch(`${NOTES_API_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote)
      });
      
      if (!response.ok) throw new Error('Failed to update note');
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
    <div className={`flex flex-col min-h-screen ${
      darkMode 
        ? 'bg-[#202124] text-gray-100'  // Google Keep dark background
        : 'bg-[#fff] text-gray-800'      // Google Keep light background
    } font-sans transition-colors duration-200`}>
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <CreateArea onAdd={handleAddNote} darkMode={darkMode} />
        
        {isLoading && (
          <div className={`flex justify-center items-center h-40 ${
            darkMode ? 'text-gray-400' : 'text-slate-600'
          }`}>
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              darkMode ? 'border-amber-500' : 'border-blue-500'
            }`}></div>
            <p className="ml-3">Loading notes...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className={`${
            darkMode 
              ? 'bg-[#41331C] border-amber-700 text-amber-200'  // Google Keep dark error
              : 'bg-red-100 border-red-500 text-red-700'         // Light error
          } border-l-4 p-4 rounded-md shadow-md mb-6`} role="alert">
            <div className="flex">
              <div className="py-1">
                <AlertTriangle className={`h-6 w-6 ${
                  darkMode ? 'text-amber-500' : 'text-red-500'
                } mr-3`} />
              </div>
              <div>
                <p className="font-bold">An Error Occurred</p>
                <p className="text-sm">{error}</p>
                <p className={`text-xs mt-2 ${
                  darkMode ? 'text-amber-300' : 'text-red-600'
                }`}>
                  This app expects a PHP backend at <code>{NOTES_API_ENDPOINT}</code>.
                  Ensure it's running and configured to handle GET, POST, PUT, and DELETE requests.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && notes.length === 0 && (
          <div className={`text-center py-10 ${
            darkMode ? 'text-gray-400' : 'text-slate-500'
          }`}>
            <Info className={`h-12 w-12 mx-auto mb-4 ${
              darkMode ? 'text-gray-500' : 'text-slate-400'
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
      
      <Footer />
      
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