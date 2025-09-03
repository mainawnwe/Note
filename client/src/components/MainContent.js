import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  Archive,
  Trash,
  Pin,
  Tag,
  FileText,
  Bell
} from 'lucide-react';
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
import TrashNoteCard from './TrashNoteCard';
import TrashWithMultiSelect from './TrashWithMultiSelect';
import SelectableNoteCard from './SelectableNoteCard';

// Fix the environment variable access
const NOTES_API_ENDPOINT = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
  notes: parentNotes,
  setNotes: setParentNotes,
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
  const [statusFilter, setStatusFilter] = React.useState('active');
  const [upcomingReminders, setUpcomingReminders] = React.useState([]);
  const [showNoteModal, setShowNoteModal] = React.useState(false);
  const [isCreateAreaVisible, setIsCreateAreaVisible] = React.useState(false);
  const [hoveredNoteId, setHoveredNoteId] = React.useState(null);
  const [localNotes, setLocalNotes] = React.useState(parentNotes || []);
  // Selection mode for non-trash tabs
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Fetch notes function
  const fetchNotes = useCallback(async () => {
    if (!NOTES_API_ENDPOINT) return;
    
    try {
      setError(null);
      
      // Build the correct query parameters based on current tab
      let url = `${NOTES_API_ENDPOINT}`;
      const params = new URLSearchParams();
      
      switch (currentTab) {
        case 'archived':
          params.append('status', 'archived');
          break;
        case 'trashed':
          params.append('status', 'trashed');
          break;
        case 'notes':
        case 'labels':
          params.append('status', 'active');
          break;
        case 'reminders':
          params.append('status', 'active');
          params.append('reminder', 'not_null');
          break;
        case 'pinned':
          params.append('status', 'active');
          params.append('pinned', 'true');
          break;
        default:
          params.append('status', 'active');
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      
      // Ensure data is an array
      const notesArray = Array.isArray(data) ? data : (data.notes || []);
      setLocalNotes(notesArray);
      
      // Also update parent notes to keep everything in sync
      if (setParentNotes) {
        setParentNotes(notesArray);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError(error.message);
    }
  }, [currentTab, NOTES_API_ENDPOINT, setParentNotes]);
  
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
  
  // Fetch notes when currentTab changes or when explicitly triggered
  useEffect(() => {
    fetchNotes();
    // Reset selection when tab changes
    setIsSelectionMode(false);
    setSelectedIds([]);
  }, [currentTab, fetchNotes]);
  
  // Sync with parent notes state when it changes, but prevent unnecessary updates
  React.useEffect(() => {
    if (Array.isArray(parentNotes)) {
      setLocalNotes(parentNotes);
      const now = new Date();
      const upcoming = parentNotes.filter(note => note.reminder && new Date(note.reminder) > now && note.status !== 'trashed');
      setUpcomingReminders(upcoming);
    }
  }, [parentNotes]);
  
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
    // Label click handling
  };

  // Selection helpers (non-trash tabs)
  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) setSelectedIds([]);
  };
  const toggleSelection = (noteId, selected) => {
    const id = String(noteId);
    setSelectedIds(prev => {
      const has = prev.includes(id);
      if (selected && !has) return [...prev, id];
      if (!selected && has) return prev.filter(x => x !== id);
      return prev;
    });
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const originals = localNotes;
    // optimistic hide
    setLocalNotes(prev => prev.filter(n => !selectedIds.includes(String(n.id))));
    try {
      if (currentTab === 'trashed') {
        await Promise.all(selectedIds.map(async (id) => {
          const res = await fetch(`${NOTES_API_ENDPOINT}?id=${id}&permanent=1`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to permanently delete');
        }));
      } else {
        await Promise.all(selectedIds.map(async (id) => {
          const res = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
        }));
      }
      if (currentTab !== 'trashed') {
        await onRefreshNotes?.();
      }
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch (e) {
      setLocalNotes(originals);
      showErrorModal(e.message || 'Bulk delete failed');
    }
  };
  
  const handleAddNote = async (newNote) => {
    try {
      // Derive content fields; for list notes, include checklist item text when no plain content provided
      const contentHtml = (newNote.content_html && String(newNote.content_html).trim() !== '') ? newNote.content_html : null;
      let contentForBackend;
      if (newNote.type === 'list') {
        const listText = Array.isArray(newNote.listItems)
          ? newNote.listItems
              .map(it => `${it && (it.checked === true || it.checked === 1 || it.checked === '1') ? '[x]' : '[ ]'} ${String(it?.text ?? '').trim()}`)
              .join('\n')
          : '';
        contentForBackend = (newNote.content && String(newNote.content).trim() !== '')
          ? newNote.content
          : listText;
      } else if (newNote.type === 'note') {
        // For plain text notes, prefer HTML when available
        contentForBackend = contentHtml ?? (newNote.content || '');
      } else {
        // For image/drawing notes, store plain text content only
        contentForBackend = newNote.content || '';
      }
      const labelIds = Array.isArray(newNote.labels)
        ? newNote.labels.map(l => {
            if (typeof l === 'object' && l !== null && l.id != null) return l.id;
            const s = String(l);
            const byId = (allLabels || []).find(L => String(L.id) === s);
            if (byId) return byId.id;
            const byName = (allLabels || []).find(L => String(L.name) === s);
            return byName ? byName.id : null;
          }).filter(v => v != null)
        : [];
      const payload = {
        title: newNote.title,
        content: contentForBackend,
        content_html: newNote.type === 'note' ? contentHtml : null,
        type: newNote.type,
        color: newNote.color || '#ffffff',
        pinned: newNote.pinned || false,
        listItems: newNote.type === 'list' ? newNote.listItems : null,
        drawing_data: newNote.type === 'drawing' ? (newNote.drawing_data ?? null) : null,
        image_url: newNote.type === 'image' ? (newNote.image_url ?? null) : null,
        category: newNote.category || null,
        labels: labelIds,
        reminder: newNote.reminder || null,
        status: newNote.status ?? 'active',
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
      await fetchNotes(); // Use local fetchNotes instead of onRefreshNotes
      setModalContent({
        title: 'Note Added',
        message: 'Your note has been saved successfully',
        type: 'success'
      });
      setShowModal(true);
      setIsCreateAreaVisible(false);
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
      // Optimistic update: immediately remove the note from local state
      const originalNotes = localNotes;
      setLocalNotes(prevNotes => prevNotes.filter(note => String(note.id) !== String(id)));
      if (currentTab === 'trashed') {
        const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}&permanent=1`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          // Revert optimistic update on error
          setLocalNotes(originalNotes);
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to permanently delete note');
        }
      } else {
        const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          // Revert optimistic update on error
          setLocalNotes(originalNotes);
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete note');
        }
      }
      // Only refresh if we're not in trash (for soft delete, we need to update the status)
      if (currentTab !== 'trashed') {
        await onRefreshNotes();
      }
    } catch (err) {
      showErrorModal(err.message);
    }
  };
  
  const handleRestoreNote = async (id) => {
    try {
      // Optimistic update: immediately remove the note from trash
      const originalNotes = localNotes;
      setLocalNotes(prevNotes => prevNotes.filter(note => String(note.id) !== String(id)));
      const response = await fetch(`${NOTES_API_ENDPOINT}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      if (!response.ok) {
        // Revert optimistic update on error
        setLocalNotes(originalNotes);
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore note');
      }
      // Refresh to update the main notes list
      await onRefreshNotes();
    } catch (err) {
      showErrorModal(err.message);
    }
  };
  
  const handleUpdateNote = async (id, updatedNote) => {
    try {
      if (!updatedNote.labels || updatedNote.labels.length === 0) {
        const existingNote = localNotes.find(note => note.id === id);
        if (existingNote && existingNote.labels) {
          updatedNote.labels = existingNote.labels;
        }
      } else {
        if (Array.isArray(updatedNote.labels) && allLabels && allLabels.length > 0) {
          const labelObjects = updatedNote.labels.map(labelId => {
            if (typeof labelId === 'object' && labelId !== null && labelId.id) {
              return labelId;
            }
            return allLabels.find(label => String(label.id) === String(labelId));
          }).filter(label => label !== undefined);
          updatedNote.labels = labelObjects;
        }
      }
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
      // Close the editor modal immediately after a successful save
      setIsNoteDetailsOpen(false);
      setSelectedNote(null);
      console.log('Notes after update:', localNotes);
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
    let filtered = localNotes;
    if (currentTab === 'notes') {
      filtered = filtered.filter(note => !note.status || note.status === 'active');
    } else if (currentTab === 'archived') {
      filtered = filtered.filter(note => note.status === 'archived');
    } else if (currentTab === 'trashed') {
      filtered = filtered.filter(note => note.status === 'trashed');
    } else if (currentTab === 'reminders') {
      filtered = filtered.filter(note => note.reminder && String(note.reminder).trim() !== '' && note.status !== 'trashed');
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
      if (normalizedCategory.endsWith('s')) {
        normalizedCategory = normalizedCategory.slice(0, -1);
      }
      const noteTypes = ['list', 'image', 'drawing', 'note'];
      if (noteTypes.includes(normalizedCategory)) {
        filtered = filtered.filter(note => note.type === normalizedCategory);
      }
    }
    if (selectedType) {
      filtered = filtered.filter(note => note.type === selectedType);
    }
    return filtered;
  })();
  
  // Highlight notes with due reminders
  const now = new Date();
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const ap = !!a.pinned;
    const bp = !!b.pinned;
    if (ap === bp) {
      const ad = new Date(a.createdAt || a.created_at || 0).getTime();
      const bd = new Date(b.createdAt || b.created_at || 0).getTime();
      return bd - ad; // Newer first when same pin status
    }
    return bp - ap; // Pinned first
  });
  const highlightedNotes = sortedNotes.map(note => {
    const reminderDate = note.reminder ? new Date(note.reminder) : null;
    return {
      ...note,
      isReminderDue: reminderDate && reminderDate <= now
    };
  });
  
  // Calculate counts for sidebar tabs
  const counts = {
    notes: localNotes.filter(note => !note.status || note.status === 'active').length,
    archived: localNotes.filter(note => note.status === 'archived').length,
    trashed: localNotes.filter(note => note.status === 'trashed').length,
    reminders: localNotes.filter(note => note.reminder && String(note.reminder).trim() !== '' && note.status !== 'trashed').length,
    pinned: localNotes.filter(note => note.pinned).length,
    labels: allLabels.length,
  };
  
  // Get tab title with icon
  const getTabTitle = () => {
    switch (currentTab) {
      case 'notes':
        return { title: 'My Notes', icon: <Grid className="h-6 w-6 mr-2" /> };
      case 'reminders':
        return { title: 'Reminders', icon: <AlertTriangle className="h-6 w-6 mr-2" /> };
      case 'archived':
        return { title: 'Archived Notes', icon: <Archive className="h-6 w-6 mr-2" /> };
      case 'trashed':
        return { title: 'Trash', icon: <Trash className="h-6 w-6 mr-2" /> };
      case 'pinned':
        return { title: 'Pinned Notes', icon: <Pin className="h-6 w-6 mr-2" /> };
      case 'labels':
        return { title: 'Labels', icon: <Tag className="h-6 w-6 mr-2" /> };
      default:
        return { title: 'My Notes', icon: <Grid className="h-6 w-6 mr-2" /> };
    }
  };
  
  const getTextColorClass = (bgColor) => {
    if (!bgColor) return darkMode ? 'text-gray-200' : 'text-gray-900';
    const c = bgColor.charAt(0) === '#' ? bgColor.substring(1) : bgColor;
    const hex = c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? 'text-white' : 'text-black';
  };
  
  const stripHtml = (html) => {
    if (typeof html !== 'string') return html;
    try {
      let s = html.replace(/<br\s*\/?>(\n)?/gi, '\n');
      s = s.replace(/<\/?p[^>]*>/gi, '\n');
      s = s.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      s = s.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      s = s.replace(/<[^>]+>/g, '');
      return s.replace(/\n{3,}/g, '\n\n').trim();
    } catch {
      return html;
    }
  };

  const tabInfo = getTabTitle();
  
  // Render dedicated Trash view with multi-select
  if (currentTab === 'trashed') {
    return (
      <div className={`flex flex-col min-h-screen ${darkMode
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200'
          : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 text-gray-900'
        }`}>
        <div className="flex flex-col flex-grow">
          <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 transition-all duration-300 relative`}>
            <TrashWithMultiSelect
              isGridView={isGridView}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              onBack={onBack}
              onClose={onClose}
              onLabelClick={onLabelClick}
              allLabels={allLabels}
              setAllLabels={setAllLabels}
              onRefreshNotes={onRefreshNotes}
              notesLoading={notesLoading}
              notes={localNotes}
              setNotes={setParentNotes}
              currentTab={currentTab}
              currentLabel={currentLabel}
              darkMode={darkMode}
            />
          </main>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    // Main container with flex column and minimum height of screen
    <div className={`flex flex-col min-h-screen ${darkMode
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200'
        : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 text-gray-900'
      }`}>
      <div className="flex flex-col flex-grow">
        <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 transition-all duration-300 relative`}>
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className={`p-3 rounded-xl ${darkMode
                      ? 'bg-teal-900/30'
                      : 'bg-gradient-to-br from-teal-100 to-cyan-100'
                    } mr-4`}>
                    {tabInfo.icon}
                  </div>
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode
                        ? 'text-teal-400'
                        : 'text-teal-600'
                      }`}>
                      {tabInfo.title}
                    </h1>
                    <p className={`text-sm ${darkMode
                        ? 'text-gray-400'
                        : 'text-gray-600'
                      }`}>
                      {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onRefreshNotes}
                    disabled={notesLoading}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm ${darkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-teal-400'
                        : 'bg-white hover:bg-teal-50 text-teal-600'
                      } ${notesLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${notesLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setIsCreateAreaVisible(true)}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm ${darkMode
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                      }`}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Note
                  </button>
                  {currentTab !== 'trashed' && (
                    <>
                      <button
                        onClick={toggleSelectionMode}
                        className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm ${isSelectionMode
                          ? (darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white')
                          : (darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700')}`}
                      >
                        {isSelectionMode ? 'Exit Selection' : 'Select Notes'}
                      </button>
                      {isSelectionMode && (
                        <button
                          onClick={handleBulkDelete}
                          className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm ${darkMode ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                          disabled={selectedIds.length === 0}
                          title={selectedIds.length === 0 ? 'No notes selected' : 'Delete selected notes'}
                        >
                          Delete Selected ({selectedIds.length})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Label Info Bar */}
              {currentTab === 'labels' && currentLabel && (
                <div className={`mb-6 p-4 rounded-xl border ${darkMode
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-white/90 border-teal-200'
                  } flex items-center justify-between shadow-sm backdrop-blur-sm`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${darkMode ? 'bg-teal-500' : 'bg-teal-500'
                      }`}></div>
                    <div>
                      <h2 className="text-lg font-semibold">{currentLabel.name}</h2>
                      <p className="text-sm opacity-70">Showing notes filtered by this label</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={onBack}
                      className={`px-3 py-1.5 rounded-lg border ${darkMode
                          ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
                          : 'border-teal-200 text-teal-700 hover:bg-teal-50'
                        }`}
                    >
                      &larr; Back
                    </button>
                    <button
                      onClick={onClose}
                      className={`px-3 py-1.5 rounded-lg border ${darkMode
                          ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
                          : 'border-teal-200 text-teal-700 hover:bg-teal-50'
                        }`}
                    >
                      &times; Close
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Create Area */}
            {isCreateAreaVisible && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="w-full max-w-2xl">
                  <CreateArea
                    onAdd={handleAddNote}
                    darkMode={darkMode}
                    onLabelsChange={(ids) => {
                      // Optional: sync currentLabel from selection if needed
                      // Here we just accept the change
                      console.log('Selected label IDs from CreateArea:', ids);
                    }}
                    currentLabel={currentLabel}
                    allLabels={allLabels}
                    setAllLabels={setAllLabels}
                    setCurrentNote={setCurrentNote}
                    setShowNoteModal={setShowNoteModal}
                    startInCreatingMode={true}
                    onClose={() => setIsCreateAreaVisible(false)}
                  />
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {notesLoading && (
              <div className={`flex flex-col justify-center items-center h-64 ${darkMode ? 'text-gray-400' : 'text-slate-600'
                }`}>
                <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-teal-500' : 'border-teal-500'
                  }`}></div>
                <p className="mt-4 text-lg">Loading your notes...</p>
                <p className="text-sm opacity-70 mt-1">Hang tight!</p>
              </div>
            )}
            {/* Error State */}
            {error && !notesLoading && (
              <div className={`${darkMode
                  ? 'bg-[#41331C] border-amber-700 text-amber-200'
                  : 'bg-red-100 border-red-500 text-red-700'
                } border-l-4 p-4 rounded-xl shadow-lg mb-8 transition-all hover:scale-[1.01]`}>
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
            {/* Empty State */}
            {!notesLoading && !error && filteredNotes.length === 0 && (
              <div className={`flex flex-col items-center justify-center py-16 rounded-2xl ${darkMode
                  ? 'bg-gray-800/30 border border-gray-700'
                  : 'bg-white/90 border border-teal-200'
                } shadow-sm backdrop-blur-sm`}>
                <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-teal-100'
                  } mb-4`}>
                  <FileText className={`h-10 w-10 ${darkMode ? 'text-gray-400' : 'text-teal-600'
                    }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                  {currentTab === 'trashed' ? 'No notes in trash' :
                    currentTab === 'archived' ? 'No archived notes' :
                      currentTab === 'reminders' ? 'No reminders set' :
                        currentTab === 'pinned' ? 'No pinned notes' :
                          currentTab === 'labels' ? 'No notes with this label' :
                            'No notes yet'}
                </h3>
                <p className={`text-center max-w-md mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  {currentTab === 'trashed' ? 'Your trash is empty. Notes you delete will appear here.' :
                    currentTab === 'archived' ? 'You haven\'t archived any notes yet.' :
                      currentTab === 'reminders' ? 'Set reminders for your notes to see them here.' :
                        currentTab === 'pinned' ? 'Pin important notes to access them quickly.' :
                          currentTab === 'labels' ? 'There are no notes with this label.' :
                            'Create your first note to get started.'}
                </p>
                {currentTab === 'notes' && (
                  <button
                    onClick={() => setIsCreateAreaVisible(true)}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all ${darkMode
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                      }`}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Note
                  </button>
                )}
              </div>
            )}
            {/* Notes Grid/List */}
            {!notesLoading && !error && filteredNotes.length > 0 && (
              <div className={isGridView ?
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" :
                "space-y-4"
              }>
                {highlightedNotes.map(note => {
                  // Determine if note has a reminder that's due
                  const isReminderDue = note.isReminderDue;
                  const isPinned = note.pinned;
                  // Base card classes
                  let cardClasses = `rounded-2xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer relative ${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'
                    }`;
                  // Add border for reminders that are due
                  if (isReminderDue) {
                    cardClasses += ` border-l-4 ${darkMode ? 'border-amber-500' : 'border-amber-500'}`;
                  }
                  // Add pin indicator
                  if (isPinned) {
                    cardClasses += ` ${darkMode ? 'border-t-4 border-blue-500' : 'border-t-4 border-blue-500'}`;
                  }
                  
                  // Debug: Log note type
                  console.log(`Rendering note with type: ${note.type}`, note);

                  // In selection mode, render selectable wrapper for all types
                  if (isSelectionMode) {
                    return (
                      <SelectableNoteCard
                        key={note.id}
                        note={{
                          ...note,
                          onDelete: handleDeleteNote,
                          onUpdate: handleUpdateNote,
                          onOpenNoteEditor: openNoteDetails,
                        }}
                        darkMode={darkMode}
                        isSelectionMode={true}
                        isSelected={selectedIds.includes(String(note.id))}
                        onSelectionChange={toggleSelection}
                      />
                    );
                  }
                  
                  if (note.type === 'drawing') {
                    return (
                      <div
                        key={note.id}
                        className={cardClasses}
                        style={{ backgroundColor: note.color || (darkMode ? '#1f2937' : '#ffffff') }}
                        onClick={() => openNoteDetails(note)}
                        onMouseEnter={() => setHoveredNoteId(note.id)}
                        onMouseLeave={() => setHoveredNoteId(null)}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                              {note.title || 'Untitled Note'}
                            </h3>
                            <div className="flex space-x-1">
                              {isPinned && (
                                <div className={`p-1 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                                  }`}>
                                  <Pin className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'
                                    }`} />
                                </div>
                              )}
                              {note.reminder && (
                                <div className={`p-1 rounded-full ${isReminderDue
                                    ? (darkMode ? 'bg-amber-900/30' : 'bg-amber-100')
                                    : (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                                  }`}>
                                  <Bell className={`h-4 w-4 ${isReminderDue
                                      ? (darkMode ? 'text-amber-400' : 'text-amber-600')
                                      : (darkMode ? 'text-gray-400' : 'text-gray-500')
                                    }`} />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Drawing Note Display */}
                          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 min-h-[200px] flex items-center justify-center">
                            {note.drawing_data ? (
                              <DrawingNoteCardDisplay
                              drawingData={note.drawing_data}
                              content={stripHtml(note.content)}
                              textColor={getTextColorClass(note.color)}
                              isEditing={false}
                              searchTerm={searchTerm}
                              onDrawingChange={() => { }}
                              />
                            ) : (
                              <div className="text-center p-4">
                                <div className="text-gray-500 dark:text-gray-400 mb-2">
                                  No drawing data available
                                </div>
                                <div className="text-sm text-gray-400 dark:text-gray-500">
                                  {note.content || 'Empty note'}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {note.reminder && (
                            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'
                              } mb-2`}>
                              Reminder: {new Date(note.reminder).toLocaleString()}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex space-x-1">
                              {note.labels && note.labels.slice(0, 2).map((label, index) => (
                                <span
                                  key={index}
                                  className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-teal-100 text-teal-700'
                                    }`}
                                >
                                  {typeof label === 'object' ? label.name : label}
                                </span>
                              ))}
                              {note.labels && note.labels.length > 2 && (
                                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-teal-100 text-teal-700'
                                  }`}>
                                  +{note.labels.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
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
                        className={cardClasses}
                        style={{ backgroundColor: note.color || (darkMode ? '#1f2937' : '#ffffff') }}
                        onClick={() => openNoteDetails(note)}
                        onMouseEnter={() => setHoveredNoteId(note.id)}
                        onMouseLeave={() => setHoveredNoteId(null)}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                              {note.title || 'Untitled Note'}
                            </h3>
                            <div className="flex space-x-1">
                              {isPinned && (
                                <div className={`p-1 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                                  }`}>
                                  <Pin className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'
                                    }`} />
                                </div>
                              )}
                              {note.reminder && (
                                <div className={`p-1 rounded-full ${isReminderDue
                                    ? (darkMode ? 'bg-amber-900/30' : 'bg-amber-100')
                                    : (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                                  }`}>
                                  <Bell className={`h-4 w-4 ${isReminderDue
                                      ? (darkMode ? 'text-amber-400' : 'text-amber-600')
                                      : (darkMode ? 'text-gray-400' : 'text-gray-500')
                                    }`} />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 min-h-[200px] flex items-center justify-center">
                            {parsedImageData ? (
                              <ImageNoteCardDisplay
                                imageData={parsedImageData}
                                content={stripHtml(note.content)}
                                textColor={getTextColorClass(note.color)}
                                isEditing={false}
                                searchTerm={searchTerm}
                                onImageChange={() => { }}
                              />
                            ) : (
                              <div className="text-center p-4">
                                <div className="text-gray-500 dark:text-gray-400 mb-2">
                                  No image data available
                                </div>
                                <div className="text-sm text-gray-400 dark:text-gray-500">
                                  {note.content || 'Empty note'}
                                </div>
                              </div>
                            )}
                          </div>
                          {note.reminder && (
                            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'
                              } mb-2`}>
                              Reminder: {new Date(note.reminder).toLocaleString()}
                            </p>
                          )}
                          <div className="flex justify-between items-center">
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex space-x-1">
                              {note.labels && note.labels.slice(0, 2).map((label, index) => (
                                <span
                                  key={index}
                                  className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-teal-100 text-teal-700'
                                    }`}
                                >
                                  {typeof label === 'object' ? label.name : label}
                                </span>
                              ))}
                              {note.labels && note.labels.length > 2 && (
                                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-teal-100 text-teal-700'
                                  }`}>
                                  +{note.labels.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Use TrashNoteCard for trashed notes, regular Note for others
                    if (currentTab === 'trashed') {
                      return (
                        <TrashNoteCard
                          key={note.id}
                          note={note}
                          onRestore={handleRestoreNote}
                          onPermanentDelete={handleDeleteNote}
                          darkMode={darkMode}
                          isReminderDue={isReminderDue}
                          hoveredNoteId={hoveredNoteId}
                          setHoveredNoteId={setHoveredNoteId}
                        />
                      );
                    } else {
                      return (
                        isSelectionMode ? (
                          <SelectableNoteCard
                            key={note.id}
                            note={{
                              ...note,
                              onDelete: handleDeleteNote,
                              onUpdate: handleUpdateNote,
                              onOpenNoteEditor: openNoteDetails,
                            }}
                            darkMode={darkMode}
                            isSelectionMode={true}
                            isSelected={selectedIds.includes(String(note.id))}
                            onSelectionChange={toggleSelection}
                          />
                        ) : (
                          <Note
                            key={note.id}
                            {...note}
                            onDelete={handleDeleteNote}
                            onUpdate={handleUpdateNote}
                            onOpenNoteEditor={openNoteDetails}
                            darkMode={darkMode}
                            isReminderDue={isReminderDue}
                            hoveredNoteId={hoveredNoteId}
                            setHoveredNoteId={setHoveredNoteId}
                          />
                        )
                      );
                    }
                  }
                })}
              </div>
            )}
          </div>
        </main>
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
              allLabels={allLabels}
              setAllLabels={setAllLabels}
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
          allLabels={allLabels}
          setAllLabels={setAllLabels}
        />
      )}
    </div>
  );
}