import React, { useState, useEffect } from 'react';
import MultiSelectMainContent from './MultiSelectMainContent';

const TrashWithMultiSelect = ({
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
  currentLabel,
  darkMode
}) => {
  const [trashedNotes, setTrashedNotes] = useState([]);

  useEffect(() => {
    // Filter trashed notes from parent notes
    const trashed = parentNotes?.filter(note => note.status === 'trashed') || [];
    setTrashedNotes(trashed);
  }, [parentNotes]);

  const handleBulkDelete = async (noteIds) => {
    // This is handled by MultiSelectMainContent
    return Promise.resolve();
  };

  const handleSingleDelete = async (noteId) => {
    // Optimistically remove from both parent and local trashed state
    const idStr = String(noteId);
    setParentNotes(prev => prev.filter(n => String(n.id) !== idStr));
    setTrashedNotes(prev => prev.filter(n => String(n.id) !== idStr));
    try {
      const base = (import.meta.env?.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:8000');
      const response = await fetch(`${base}/api?id=${noteId}&permanent=1`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      // Success: UI already updated optimistically; avoid immediate refresh
    } catch (error) {
      // Rollback by reloading from server
      await onRefreshNotes();
      throw error;
    }
  };

  const handleSingleRestore = async (noteId) => {
    // Optimistically remove from both parent and local trashed state
    const idStr = String(noteId);
    setParentNotes(prev => prev.filter(n => String(n.id) !== idStr));
    setTrashedNotes(prev => prev.filter(n => String(n.id) !== idStr));
    try {
      const base = (import.meta.env?.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:8000');
      const response = await fetch(`${base}/api?id=${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore note');
      }
      
      // Success: UI already updated optimistically; avoid immediate refresh
    } catch (error) {
      // Rollback by reloading from server
      await onRefreshNotes();
      throw error;
    }
  };

  return (
    <MultiSelectMainContent
      notes={trashedNotes}
      darkMode={darkMode}
      onBulkDelete={handleBulkDelete}
      onBulkRestore={handleSingleRestore}
      onSingleDelete={handleSingleDelete}
      onSingleRestore={handleSingleRestore}
      isGridView={isGridView}
      notesLoading={notesLoading}
      onRefreshNotes={onRefreshNotes}
    />
  );
};

export default TrashWithMultiSelect;
