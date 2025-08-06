import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import CreateArea from './CreateArea';
import Note from './Note';
import Footer from './Footer';
import Modal from './Modal';
import NoteDetailsModal from './NoteDetailsModal';
import NoteEditor from './NoteEditor';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import DrawingNoteCardDisplay from './DrawingNoteCardDisplay';
import ImageNoteCardDisplay from './ImageNoteCardDisplay';

const NOTES_API_ENDPOINT = 'http://localhost:8000';

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
  setNotes,
  currentTab,
  currentLabel
}) {
  const { darkMode } = useTheme();

  const [error, setError] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [modalContent, setModalContent] = React.useState({});
  const [retryCount, setRetryCount] = React.useState(0);

  const [selectedNote, setSelectedNote] = React.useState(null);
  const [currentNote, setCurrentNote] = React.useState(null);
  const [isNoteDetailsOpen, setIsNoteDetailsOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('active'); // 'active', 'archived', 'trashed'
  const [upcomingReminders, setUpcomingReminders] = React.useState([]);
  const [showNoteModal, setShowNoteModal] = React.useState(false);
  // Remove internal currentTab state and use prop instead
  // const [currentTab, setCurrentTab] = React.useState('notes'); // 'notes', 'reminders', 'archived', 'trashed', 'pinned', 'labels'

  // New state for sidebar collapsed/expanded


  // Update statusFilter when selectedCategory or currentTab changes
  React.useEffect(() => {
    if (currentTab === 'archived') {
      setStatusFilter('archived');
    } else if (currentTab === 'trashed') {
      setStatusFilter('trashed');
    } else if (currentTab === 'notes' || currentTab === 'reminders' || currentTab === 'pinned' || currentTab === 'labels') {
      setStatusFilter('active');
    }
  }, [currentTab]);

  // Fetch notes with status filter
  React.useEffect(() => {
    const fetchNotes = async () => {
      try {
        let url = `${NOTES_API_ENDPOINT}?status=${statusFilter}`;
        if (currentTab === 'reminders') {
          url += '&reminder=1'; // Custom param to filter notes with reminders
        }
        if (currentTab === 'pinned') {
          url += '&pinned=1'; // Custom param to filter pinned notes
        }
        if ((currentTab === 'labels' || currentTab === 'notes') && currentLabel) {
          url += `&label=${encodeURIComponent(currentLabel.name)}`;
        }
        console.log('Fetching notes with URL:', url);
        if (selectedType) {
          url += `&type=${encodeURIComponent(selectedType)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch notes:', errorText);
          throw new Error(`Failed to fetch notes: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        setNotes(data);

        // Extract upcoming reminders (reminder datetime in future)
        const now = new Date();
        const upcoming = data.filter(note => note.reminder && new Date(note.reminder) > now && note.status !== 'trashed');
        setUpcomingReminders(upcoming);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError(err.message);
      }
    };
    fetchNotes();
  }, [statusFilter, currentLabel?.id, selectedType, currentTab]);

  React.useEffect(() => {
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
    // Removed setCurrentLabel call because currentLabel is now a prop and no setter is available
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
        labels: newNote.labels || [],
        reminder: newNote.reminder || null,
        status: 'active',
      };

      console.log('Sending note payload:', payload);

      const response = await fetch(NOTES_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
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
      console.error('Error adding note:', err);
      setModalContent({
        title: 'Error',
        message: err.message || 'Failed to add note',
        type: 'error'
      });
      setShowModal(true);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      if (currentTab === 'trashed') {
        // Permanently delete note
        const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}&permanent=1`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to permanently delete note');
        }
      } else {
        // Soft delete (move to trash)
        const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete note');
        }
      }
      await onRefreshNotes();
    } catch (err) {
      showErrorModal(err.message);
    }
  };

  const handleRestoreNote = async (id) => {
    try {
      const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore note');
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
      console.log('Updating note with reminder:', updatedNote.reminder);
      // Ensure reminder field is included in updatedNote before sending
      if (!updatedNote.hasOwnProperty('reminder') && selectedNote && selectedNote.reminder) {
        updatedNote.reminder = selectedNote.reminder;
      }
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
      // Removed setCurrentLabel call because currentLabel is now a prop and no setter is available

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
    console.log('openNoteDetails called with note:', note);
    setSelectedNote(note);
    setIsNoteDetailsOpen(true);
    setShowNoteModal(false);
  };

  const closeNoteDetails = () => {
    console.log('closeNoteDetails called');
    setSelectedNote(null);
    setIsNoteDetailsOpen(false);
  };

  // Client-side filter notes by selected type or label and status
  const filteredNotes = (() => {
    let filtered = notes;

    if (currentTab === 'notes') {
      filtered = filtered.filter(note => !note.status || note.status === 'active');
    } else if (currentTab === 'archived') {
      filtered = filtered.filter(note => note.status === 'archived');
    } else if (currentTab === 'trashed') {
      filtered = filtered.filter(note => note.status === 'trashed');
    } else if (currentTab === 'reminders') {
      const now = new Date();
      filtered = filtered.filter(note => note.reminder && new Date(note.reminder) > now && note.status !== 'trashed');
    } else if (currentTab === 'pinned') {
      filtered = filtered.filter(note => note.pinned);
    } else if (currentTab === 'labels' && currentLabel) {
      filtered = filtered.filter(note => note.labels.some(label =>
        typeof label === 'object'
          ? String(label.id) === String(currentLabel.id)
          : String(label) === String(currentLabel.id)
      ));
    } else if (currentLabel) {
      filtered = filtered.filter(note => note.labels.some(label =>
        typeof label === 'object'
          ? String(label.id) === String(currentLabel.id)
          : String(label) === String(currentLabel.id)
      ));
    }

    if (selectedCategory && currentTab !== 'labels') {
      let normalizedCategory = selectedCategory.trim().toLowerCase();
      // Convert plural to singular by removing trailing 's' if present
      if (normalizedCategory.endsWith('s')) {
        normalizedCategory = normalizedCategory.slice(0, -1);
      }
      const noteTypes = ['list', 'image', 'drawing', 'note']; // Add other note types as needed
      if (noteTypes.includes(normalizedCategory)) {
        filtered = filtered.filter(note => note.type === normalizedCategory);
      }
    }
    if (selectedType) {
      filtered = filtered.filter(note => note.type === selectedType);
    }

    return filtered;
  })();

  // Highlight notes with due reminders (reminder datetime <= now)
  const now = new Date();
  const highlightedNotes = filteredNotes.map(note => {
    const reminderDate = note.reminder ? new Date(note.reminder) : null;
    return {
      ...note,
      isReminderDue: reminderDate && reminderDate <= now
    };
  });

  // Calculate counts for sidebar tabs
  const counts = {
    notes: notes.filter(note => !note.status || note.status === 'active').length,
    archived: notes.filter(note => note.status === 'archived').length,
    trashed: notes.filter(note => note.status === 'trashed').length,
    reminders: notes.filter(note => note.reminder && new Date(note.reminder) > new Date() && note.status !== 'trashed').length,
    pinned: notes.filter(note => note.pinned).length,
    labels: allLabels.length,
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col">
        {/* Main Menu Button row above sidebar */}
          <div className="flex flex-grow">
            <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 transition-all duration-300`}>
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-blue-600'}`}>
                    {currentTab === 'notes' && 'My Notes'}
                    {currentTab === 'reminders' && 'Reminders'}
                    {currentTab === 'archived' && 'Archived Notes'}
                    {currentTab === 'trashed' && 'Trash'}
                    {currentTab === 'pinned' && 'Pinned Notes'}
                    {currentTab === 'labels' && 'Labels'}
                  </h1>
                  <div className="flex space-x-2">
                    {/* Remove old status filter buttons */}
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
                </div>

              {currentTab === 'labels' && currentLabel && (
                <div className="mb-6 p-4 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-between max-w-6xl mx-auto">
                  <div>
                    <h2 className="text-lg font-semibold">{currentLabel.name}</h2>
                    <p className="text-sm opacity-70">Showing notes filtered by this label.</p>
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

              <CreateArea onAdd={handleAddNote} darkMode={darkMode} onLabelClick={handleLabelClick} currentLabel={currentLabel} allLabels={allLabels} setAllLabels={setAllLabels} setCurrentNote={setCurrentNote} setShowNoteModal={setShowNoteModal} />

              {notesLoading && (
                <div className={`flex flex-col justify-center items-center h-64 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-amber-500' : 'border-blue-500'}`}></div>
                  <p className="mt-4 text-lg">Loading your notes...</p>
                  <p className="text-sm opacity-70 mt-1">Hang tight!</p>
                </div>
              )}
              {error && !notesLoading && (
                <div className={`${
                  darkMode
                    ? 'bg-[#41331C] border-amber-700 text-amber-200'
                    : 'bg-red-100 border-red-500 text-red-700'
                } border-l-4 p-4 rounded-lg shadow-lg mb-8 transition-all hover:scale-[1.01]'`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle className={"h-6 w-6 " + (darkMode ? "text-amber-500" : "text-red-500")} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-bold">Connection Error</h3>
                      <p className="text-sm">{error}</p>
                      <div className={"mt-3 p-3 rounded-md " + (darkMode ? "bg-amber-900/30" : "bg-red-50")}>
                        <p className={"text-xs " + (darkMode ? "text-amber-300" : "text-red-600")}>
                          This app expects a PHP backend at <code className="font-mono bg-black/20 px-1.5 py-0.5 rounded">{NOTES_API_ENDPOINT}</code>.
                          Ensure it's running and configured to handle GET, POST, PUT, and DELETE requests.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Render notes as a simple list since NoteGrid and NoteList components are missing */}
              {!notesLoading && !error && (
                <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
                  {highlightedNotes.map(note => {
                    if (note.type === 'drawing') {
                      return (
                        <div
                          key={note.id}
                          className="rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 cursor-pointer min-h-[300px] flex flex-col justify-between"
                          onClick={() => openNoteDetails(note)}
                        >
                          <h3 className={`font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {note.title || 'Untitled Note'}
                          </h3>
                          <DrawingNoteCardDisplay
                            drawingData={note.drawing_data}
                            content={note.content}
                            textColor={darkMode ? 'text-gray-200' : 'text-gray-900'}
                            isEditing={false}
                            searchTerm={searchTerm}
                            onDrawingChange={() => {}}
                          />
                          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      );
                    } else if (note.type === 'image') {
                      let parsedImageData;
                      try {
                        parsedImageData = JSON.parse(note.image_url);
                      } catch {
                        parsedImageData = note.image_url;
                      }
                      return (
                        <div
                          key={note.id}
                          className="rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 cursor-pointer"
                          onClick={() => openNoteDetails(note)}
                        >
                          <h3 className={`font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {note.title || 'Untitled Note'}
                          </h3>
                          <ImageNoteCardDisplay
                            imageData={parsedImageData}
                            content={note.content}
                            textColor={darkMode ? 'text-gray-200' : 'text-gray-900'}
                            isEditing={false}
                            searchTerm={searchTerm}
                            onImageChange={() => {}}
                          />
                          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <Note
                          key={note.id}
                          {...note}
                          onDelete={handleDeleteNote}
                          onUpdate={handleUpdateNote}
                          onOpenNoteEditor={openNoteDetails}
                          darkMode={darkMode}
                        />
                      );
                    }
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
      {showModal && (
        <Modal type={modalContent.type} title={modalContent.title} onClose={() => setShowModal(false)}>
          <p>{modalContent.message}</p>
        </Modal>
      )}
      {isNoteDetailsOpen && selectedNote && (
        <>
          {console.log('Rendering NoteEditor Modal with selectedNote:', selectedNote)}
          {console.log('SelectedNote content:', selectedNote.content, 'title:', selectedNote.title)}
          <Modal
            isOpen={isNoteDetailsOpen}
            type="noteEditor"
            title="Edit Note"
            onClose={closeNoteDetails}
            contentStyle={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              padding: '1rem',
              maxWidth: '640px',
              margin: '0 auto',
              borderRadius: '1rem',
            }}
          >
            <NoteEditor
              initialNote={selectedNote}
              onSave={handleUpdateNote}
              onCancel={closeNoteDetails}
              onDelete={handleDeleteNote}
              darkMode={darkMode}
              isModal={true}
            />
          </Modal>
        </>
      )}
      {showNoteModal && currentNote && (
        <NoteEditor
          initialNote={currentNote}
          onSave={handleUpdateNote}
          onCancel={() => setShowNoteModal(false)}
          onDelete={handleDeleteNote}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
