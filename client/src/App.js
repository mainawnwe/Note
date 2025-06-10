import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit3, Save, XCircle, AlertTriangle, Info } from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8000';
const NOTES_API_ENDPOINT = `${API_BASE_URL}/notes.php`;

export default function App() {
  const [notes, setNotes] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(NOTES_API_ENDPOINT);
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        // Sort notes: pinned first, then by createdAt descending
        const sortedNotes = data.sort((a, b) => {
          if (b.pinned === a.pinned) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return b.pinned - a.pinned;
        });
        setNotes(sortedNotes);
        // Extract unique labels
        const labels = [...new Set(sortedNotes.flatMap(note => 
          note.labels ? note.labels.split(',').filter(l => l) : []
        ))];
        setAllLabels(labels);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setError(`Failed to load notes. ${err.message}. Please ensure your PHP backend is running at ${NOTES_API_ENDPOINT}`);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const createLabel = (newLabel) => {
    if (!allLabels.includes(newLabel)) {
      setAllLabels([...allLabels, newLabel]);
    }
  };

  const deleteLabel = (labelToDelete) => {
    setAllLabels(allLabels.filter(label => label !== labelToDelete));
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async (newNote) => {
    if (!newNote.title && !newNote.content) {
      showAppModal("Cannot add empty note", "Please provide a title or content.", "warning");
      return;
    }
    try {
      const response = await fetch(NOTES_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const addedNote = await response.json();
      setNotes(prevNotes => [addedNote, ...prevNotes]);
      showAppModal("Note Added", "Your note has been successfully added.", "success");
    } catch (err) {
      console.error("Failed to add note:", err);
      setError(`Failed to add note: ${err.message}`);
      showAppModal("Error Adding Note", `Could not add note: ${err.message}`, "error");
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      showAppModal("Note Deleted", "The note has been successfully deleted.", "info");
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError(`Failed to delete note: ${err.message}`);
      showAppModal("Error Deleting Note", `Could not delete note: ${err.message}`, "error");
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    if (!updatedNote.id) {
      showAppModal("Error Updating Note", "Note ID is missing.", "error");
      return;
    }
    try {
      const response = await fetch(`${NOTES_API_ENDPOINT}?id=${updatedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const updated = await response.json();
      setNotes(prevNotes => {
        const updatedNotes = prevNotes.map(note => 
          note.id === updated.id ? updated : note
        );
        // Sort notes: pinned first, then by createdAt descending
        updatedNotes.sort((a, b) => {
          if (b.pinned === a.pinned) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return b.pinned - a.pinned;
        });
        return updatedNotes;
      });
      showAppModal("Note Updated", "The note has been successfully updated.", "success");
    } catch (err) {
      console.error("Failed to update note:", err);
      setError(`Failed to update note: ${err.message}`);
      showAppModal("Error Updating Note", `Could not update note: ${err.message}`, "error");
    }
  };

  const showAppModal = (title, message, type = 'info') => {
    setModalContent({ title, message, type });
    setShowModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <CreateArea onAdd={handleAddNote} />
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-slate-600">Loading notes...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6" role="alert">
            <div className="flex">
              <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
              <div>
                <p className="font-bold">An Error Occurred</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-2">
                  This app expects a PHP backend at <code>{NOTES_API_ENDPOINT}</code>.
                  Ensure it's running and configured to handle GET, POST, PUT, and DELETE requests.
                </p>
              </div>
            </div>
          </div>
        )}
        {!isLoading && !error && notes.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            <Info className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-xl">No notes yet.</p>
            <p>Start by adding a new note above!</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.map(note => (
            <Note
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              createdAt={note.createdAt}
              pinned={note.pinned}
              color={note.color}  // Add this line
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
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// --- Header Component ---
function Header() {
  return (
    <header className="bg-amber-500 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            React Keep
          </h1>
        </div>
      </div>
    </header>
  );
}

// --- CreateArea Component ---
function CreateArea({ onAdd }) {
  const [note, setNote] = useState({ title: '', content: '', color: '#ffffff' });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote(prevNote => ({ ...prevNote, [name]: value }));
  };

  const handleColorChange = (color) => {
    setNote(prevNote => ({ ...prevNote, color }));
  };

  const submitNote = (e) => {
    e.preventDefault();
    if (note.title.trim() === '' && note.content.trim() === '') return;
    onAdd({ ...note });
    setNote({ title: '', content: '', color: '#ffffff' });
    setIsExpanded(false);
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const colors = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb'];

  return (
    <div className="my-6 max-w-xl mx-auto">
      <form onSubmit={submitNote} className="bg-white p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
        {isExpanded && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
            className="w-full p-2 mb-3 text-lg font-semibold border-b border-slate-300 focus:outline-none focus:border-amber-500 transition-colors"
          />
        )}
        <textarea
          name="content"
          onFocus={handleFocus}
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
          className="w-full p-2 text-slate-700 border-b border-slate-300 focus:outline-none focus:border-amber-500 resize-none transition-all duration-200"
          required={!note.title && isExpanded}
        />
        {isExpanded && (
          <>
            <div className="flex space-x-2 my-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 ${note.color === color ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-5 rounded-md shadow-md transition-colors duration-150 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                  <path d="M12 2C10.895 2 10 2.895 10 4v5H7v2h3v5c0 1.105.895 2 2 2s2-.895 2-2v-5h3v-2h-3V4c0-1.105-.895-2-2-2z" />
                </svg>
                Add
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

// --- Note Component ---
function Note(props) {
  const { id, title, content, createdAt, pinned, color, onDelete, onUpdate } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [isPinned, setIsPinned] = useState(pinned || false);

  const handleDelete = () => onDelete(id);
  const handleEdit = () => setIsEditing(true);

  const togglePin = () => {
    const newPinned = !isPinned ? 1 : 0;
    setIsPinned(Boolean(newPinned));
    onUpdate({ id, pinned: newPinned });
  };

  const handleSave = () => {
    if (editedTitle.trim() === '' && editedContent.trim() === '') return;
    onUpdate({ id, title: editedTitle, content: editedContent, pinned: isPinned ? 1 : 0 });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(title);
    setEditedContent(content);
    setIsPinned(pinned || false);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="rounded-lg shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200 break-inside-avoid" style={{ backgroundColor: color || '#ffffff' }}>
      {isEditing ? (
        <div className="flex flex-col h-full">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="font-bold text-xl mb-2 p-2 border border-slate-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="Title"
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="text-slate-700 text-base mb-3 p-2 border border-slate-300 rounded-md resize-none h-32 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Content"
          />
          <div className="flex justify-between items-center mt-auto">
            <button
              onClick={togglePin}
              className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-yellow-300' : 'bg-slate-200 hover:bg-slate-300'}`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPinned ? 'text-yellow-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-colors"
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-slate-300 hover:bg-slate-400 text-slate-700 p-2 rounded-full shadow-md transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        </div>
        ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-xl mb-2 break-words">{title || "Untitled Note"}</h3>
            <button
              onClick={togglePin}
              className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-yellow-300' : 'bg-slate-200 hover:bg-slate-300'}`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPinned ? 'text-yellow-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            </button>
          </div>
          <p className="text-slate-700 text-base mb-3 whitespace-pre-wrap break-words">{content}</p>
          <div className="mt-auto pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3">
              {createdAt ? `Created: ${formatDate(createdAt)}` : 'Date unknown'}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEdit}
                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Footer Component ---
function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-800 text-slate-300 text-center p-6 shadow-inner">
      <p>&copy; {currentYear} React Keep App. All rights reserved.</p>
    </footer>
  );
}

// --- Modal Component ---
function Modal({ title, message, type = 'info', onClose }) {
  const Icon = type === 'error' ? AlertTriangle : type === 'warning' ? AlertTriangle : Info;
  const iconColor = type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-blue-500';
  const buttonColor = type === 'error' ? 'bg-red-500 hover:bg-red-600' : 
                     type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600';

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 ease-out scale-95 animate-modalEnter">
        <div className="flex items-center mb-4">
          <Icon className={`h-8 w-8 mr-3 ${iconColor}`} />
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`${buttonColor} text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}