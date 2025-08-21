import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Grid,
  Plus,
  Trash,
  FileText,
  CheckSquare
} from 'lucide-react';
import SelectableTrashNoteCard from './SelectableTrashNoteCard';
import MultiSelectHeader from './MultiSelectHeader';
import BulkDeleteConfirmation from './BulkDeleteConfirmation';
import Modal from './Modal';
import { useNoteSelection } from '../hooks/useNoteSelection';

const MultiSelectMainContent = ({
  notes = [],
  darkMode = false,
  onBulkDelete,
  onBulkRestore,
  onSingleDelete,
  onSingleRestore,
  isGridView = true,
  notesLoading = false,
  onRefreshNotes
}) => {
  const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const {
    selectedNoteIds,
    selectedCount,
    isSelectionMode,
    allSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectionMode,
    exitSelectionMode,
    isNoteSelected
  } = useNoteSelection(notes);

  const handleBulkDelete = () => {
    if (selectedCount > 0) {
      setShowBulkDeleteConfirmation(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      const response = await fetch('http://localhost:8000/bulk-permanent-delete.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteIds: selectedNoteIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete notes');
      }

      const result = await response.json();
      setShowBulkDeleteConfirmation(false);
      exitSelectionMode();
      
      // Refresh notes after deletion
      if (onRefreshNotes) {
        await onRefreshNotes();
      }
      
      setModalContent({
        title: 'Success',
        message: `${result.deletedCount} ${result.deletedCount === 1 ? 'note' : 'notes'} permanently deleted`,
        type: 'success'
      });
      setShowModal(true);
    } catch (error) {
      setModalContent({
        title: 'Error',
        message: error.message || 'Failed to delete notes',
        type: 'error'
      });
      setShowModal(true);
    }
  };

  const handleSingleDelete = async (noteId) => {
    try {
      await onSingleDelete(noteId);
    } catch (error) {
      setModalContent({
        title: 'Error',
        message: error.message || 'Failed to delete note',
        type: 'error'
      });
      setShowModal(true);
    }
  };

  const handleSingleRestore = async (noteId) => {
    try {
      await onSingleRestore(noteId);
    } catch (error) {
      setModalContent({
        title: 'Error',
        message: error.message || 'Failed to restore note',
        type: 'error'
      });
      setShowModal(true);
    }
  };

  const filteredNotes = notes.filter(note => note.status === 'trashed');

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'}`}>
      <div className="flex flex-col">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 transition-all duration-300">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-amber-900/30' : 'bg-blue-100'} mr-4`}>
                    <Trash className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-blue-600'}`}>
                      Trash with Multi-Select
                    </h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onRefreshNotes}
                    disabled={notesLoading}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm ${darkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-amber-400'
                      : 'bg-white hover:bg-gray-100 text-blue-600'
                      } ${notesLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${notesLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={toggleSelectionMode}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm ${
                      isSelectionMode
                        ? (darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white')
                        : (darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700')
                    }`}
                  >
                    <CheckSquare className="h-5 w-5 mr-2" />
                    {isSelectionMode ? 'Exit Selection' : 'Select Notes'}
                  </button>
                </div>
              </div>

              {/* Multi-Select Header */}
              {isSelectionMode && (
                <MultiSelectHeader
                  selectedCount={selectedCount}
                  totalCount={filteredNotes.length}
                  onSelectAll={selectAll}
                  onDeselectAll={deselectAll}
                  onBulkDelete={handleBulkDelete}
                  onCancelSelection={exitSelectionMode}
                  darkMode={darkMode}
                  allSelected={allSelected}
                />
              )}
            </div>

            {/* Loading State */}
            {notesLoading && (
              <div className={`flex flex-col justify-center items-center h-64 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-amber-500' : 'border-blue-500'}`}></div>
                <p className="mt-4 text-lg">Loading your notes...</p>
                <p className="text-sm opacity-70 mt-1">Hang tight!</p>
              </div>
            )}

            {/* Empty State */}
            {!notesLoading && filteredNotes.length === 0 && (
              <div className={`flex flex-col items-center justify-center py-16 rounded-2xl ${darkMode ? 'bg-gray-800/30' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                  <FileText className={`h-10 w-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  No notes in trash
                </h3>
                <p className={`text-center max-w-md mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your trash is empty. Notes you delete will appear here.
                </p>
              </div>
            )}

            {/* Notes Grid/List */}
            {!notesLoading && filteredNotes.length > 0 && (
              <div className={isGridView ?
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" :
                "space-y-4"
              }>
                {filteredNotes.map(note => (
                  <SelectableTrashNoteCard
                    key={note.id}
                    note={note}
                    onRestore={handleSingleRestore}
                    onPermanentDelete={handleSingleDelete}
                    darkMode={darkMode}
                    isSelectionMode={isSelectionMode}
                    isSelected={isNoteSelected(note.id)}
                    onSelectionChange={toggleSelection}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmation
        isOpen={showBulkDeleteConfirmation}
        onClose={() => setShowBulkDeleteConfirmation(false)}
        onConfirm={handleConfirmBulkDelete}
        selectedCount={selectedCount}
        darkMode={darkMode}
      />

      {/* Success/Error Modal */}
      {showModal && (
        <Modal type={modalContent.type} title={modalContent.title} onClose={() => setShowModal(false)}>
          <p>{modalContent.message}</p>
        </Modal>
      )}
    </div>
  );
};

export default MultiSelectMainContent;