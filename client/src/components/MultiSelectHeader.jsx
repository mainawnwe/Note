import React from 'react';
import { CheckSquare, Square, Trash2, X } from 'lucide-react';

const MultiSelectHeader = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onCancelSelection,
  darkMode,
  allSelected
}) => {
  const formatSelectionCount = (count) => {
    return count === 1 ? `${count} note selected` : `${count} notes selected`;
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border mb-4 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-200' 
        : 'bg-blue-50 border-blue-200 text-gray-900'
    }`}>
      <div className="flex items-center space-x-4">
        {/* Select All Toggle */}
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-blue-100 text-blue-700'
          }`}
          title={allSelected ? 'Deselect All' : 'Select All'}
        >
          {allSelected ? (
            <CheckSquare size={18} />
          ) : (
            <Square size={18} />
          )}
          <span className="text-sm font-medium">
            {allSelected ? 'Deselect All' : 'Select All'}
          </span>
        </button>

        {/* Selection Count */}
        <div className={`text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {formatSelectionCount(selectedCount)}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Bulk Delete Button */}
        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium">
              Delete Selected
            </span>
          </button>
        )}

        {/* Cancel Selection */}
        <button
          onClick={onCancelSelection}
          className={`p-2 rounded-md transition-colors ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-400'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Cancel Selection"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default MultiSelectHeader;