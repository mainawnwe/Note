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
    try {
      const response = await fetch(`http://localhost:8000?id=${noteId}&permanent=1`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      await onRefreshNotes();
    } catch (error) {
      throw error;
    }
  };

  const handleSingleRestore = async (noteId) => {
    try {
      const response = await fetch(`http://localhost:8000?id=${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore note');
      }
      
      await onRefreshNotes();
    } catch (error) {
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
