import { useState, useCallback, useMemo } from 'react';

// Selection mode constants
export const SelectionMode = {
  NONE: 'none',
  PARTIAL: 'partial', 
  ALL: 'all'
};

export const useNoteSelection = (notes = []) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Get current selection mode
  const selectionMode = useMemo(() => {
    if (selectedNoteIds.length === 0) return SelectionMode.NONE;
    if (selectedNoteIds.length === notes.length) return SelectionMode.ALL;
    return SelectionMode.PARTIAL;
  }, [selectedNoteIds.length, notes.length]);

  // Toggle selection for a single note
  const toggleSelection = useCallback((noteId, forceSelected = null) => {
    setSelectedNoteIds(prev => {
      const isCurrentlySelected = prev.includes(noteId);
      const shouldSelect = forceSelected !== null ? forceSelected : !isCurrentlySelected;
      
      if (shouldSelect && !isCurrentlySelected) {
        return [...prev, noteId];
      } else if (!shouldSelect && isCurrentlySelected) {
        return prev.filter(id => id !== noteId);
      }
      return prev;
    });
  }, []);

  // Select all notes
  const selectAll = useCallback(() => {
    const allNoteIds = notes.map(note => note.id);
    setSelectedNoteIds(allNoteIds);
  }, [notes]);

  // Deselect all notes
  const deselectAll = useCallback(() => {
    setSelectedNoteIds([]);
  }, []);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => {
      if (prev) {
        // Exiting selection mode, clear selections
        setSelectedNoteIds([]);
      }
      return !prev;
    });
  }, []);

  // Enter selection mode
  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  // Exit selection mode
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedNoteIds([]);
  }, []);

  // Check if a note is selected
  const isNoteSelected = useCallback((noteId) => {
    return selectedNoteIds.includes(noteId);
  }, [selectedNoteIds]);

  // Get selected notes
  const selectedNotes = useMemo(() => {
    return notes.filter(note => selectedNoteIds.includes(note.id));
  }, [notes, selectedNoteIds]);

  return {
    selectedNoteIds,
    selectedNotes,
    selectedCount: selectedNoteIds.length,
    isSelectionMode,
    selectionMode,
    allSelected: selectionMode === SelectionMode.ALL,
    partiallySelected: selectionMode === SelectionMode.PARTIAL,
    noneSelected: selectionMode === SelectionMode.NONE,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectionMode,
    enterSelectionMode,
    exitSelectionMode,
    isNoteSelected,
    setSelectedNoteIds
  };
};