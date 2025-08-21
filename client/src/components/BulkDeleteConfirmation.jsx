import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

const BulkDeleteConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedCount = 0,
  darkMode = false 
}) => {
  const formatBulkDeleteMessage = (count) => {
    return count === 1 
      ? `Are you sure you want to permanently delete this note?`
      : `Are you sure you want to permanently delete ${count} notes?`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permanently Delete Notes?"
      contentStyle={{
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        color: darkMode ? '#f1f5f9' : '#1e293b',
        borderRadius: '12px',
        maxWidth: '500px',
      }}
    >
      <div className="space-y-4">
        {/* Warning Icon and Message */}
        <div className="flex items-start space-x-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            darkMode ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <AlertTriangle 
              size={20} 
              className={darkMode ? 'text-red-400' : 'text-red-600'} 
            />
          </div>
          <div className="flex-1">
            <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {formatBulkDeleteMessage(selectedCount)}
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
              This action cannot be undone. {selectedCount > 1 ? 'These notes' : 'This note'} will be completely removed from your account.
            </p>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedCount > 1 && (
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <p className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {selectedCount} notes selected for deletion
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete {selectedCount > 1 ? `${selectedCount} Notes` : 'Note'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkDeleteConfirmation;