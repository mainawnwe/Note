import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import LabelSelector from './LabelSelector';
import './ModalStyles.css';

function EditLabelsModal({ isOpen, onClose, labels, setLabels, darkMode, onLabelsChange }) {
  const [editedLabels, setEditedLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEditedLabels(labels);
  }, [labels]);

  const handleNameChange = (id, newName) => {
    setEditedLabels(prev =>
      prev.map(label => (label.id === id ? { ...label, name: newName } : label))
    );
  };

  const handleColorChange = (id, newColor) => {
    setEditedLabels(prev =>
      prev.map(label => (label.id === id ? { ...label, color: newColor } : label))
    );
  };

  // New function to handle new label creation from LabelSelector
  const handleNewLabelAdd = (newLabel) => {
    setEditedLabels(prev => [...prev, newLabel]);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Separate new labels (without id) and existing labels (with id)
      const newLabels = editedLabels.filter(label => !label.id);
      const existingLabels = editedLabels.filter(label => label.id);

      // Save new labels via POST
      for (const label of newLabels) {
        const response = await fetch('http://localhost:8000/labels.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: label.name,
            color: label.color,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to create label');
        }
        const result = await response.json();
        // Update label with returned id
        label.id = result.id;
      }

      // Save existing labels via PUT
      for (const label of existingLabels) {
        const response = await fetch('http://localhost:8000/labels.php', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: label.id,
            name: label.name,
            color: label.color,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update label');
        }
      }

      setLabels(editedLabels);
      if (onLabelsChange) {
        onLabelsChange(editedLabels);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/labels.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${encodeURIComponent(id)}`,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete label');
      }
      const updatedLabels = editedLabels.filter(label => label.id !== id);
      setEditedLabels(updatedLabels);
      setLabels(updatedLabels);
      if (onLabelsChange) {
        onLabelsChange(updatedLabels);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div id="modal-root" className="modal-overlay" aria-modal="true" role="dialog" tabIndex={-1}>
      <div className="modal-content">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-3xl font-bold leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Manage Labels</h2>
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-100 rounded flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </div>
        )}
        <LabelSelector
          selectedLabels={editedLabels}
          onChange={setEditedLabels}
          darkMode={darkMode}
          onLabelsChange={handleNewLabelAdd}
        />
        <div className="space-y-3 max-h-56 overflow-y-auto mt-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-700">
          {editedLabels.map(label => (
            <div
              key={label.id}
              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <input
                type="text"
                value={label.name}
                onChange={(e) => handleNameChange(label.id, e.target.value)}
                className={`flex-grow p-3 rounded border text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-black placeholder-gray-600'
                }`}
                placeholder="Label name"
              />
              <input
                type="color"
                value={label.color}
                onChange={(e) => handleColorChange(label.id, e.target.value)}
                title="Pick label color"
                className="w-12 h-12 p-0 border-0 cursor-pointer rounded shadow"
              />
              <button
                onClick={() => handleDelete(label.id)}
                disabled={loading}
                className="text-red-600 hover:text-red-800 font-bold px-4 text-2xl focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                title="Delete label"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root') || document.body;
  return ReactDOM.createPortal(modalContent, modalRoot);
}

export default EditLabelsModal;
