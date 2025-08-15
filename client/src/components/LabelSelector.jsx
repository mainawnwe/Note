import React, { useState } from 'react';
import useLabels from '../hooks/useLabels';

function LabelSelector({ selectedLabels, onChange, darkMode, onLabelClick }) {
  const { labels, loading, error, addLabel, deleteLabel } = useLabels();
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#a7f3d0'); // default greenish

  
  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const newLabel = await addLabel(newLabelName.trim(), newLabelColor);
      onChange([...selectedLabels, newLabel]);
      setNewLabelName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    try {
      await deleteLabel(labelId);
      onChange(selectedLabels.filter(label => label.id !== labelId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="label-selector">
      <div className="mb-2 font-semibold">Labels</div>
      {loading && <div>Loading labels...</div>}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex flex-wrap gap-2 mb-2">
        {labels.map(label => {
          const selected = selectedLabels.some(l => l.id === label.id);
          return (
            <div key={label.id} className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  const exists = selectedLabels.some(l => l.id === label.id);
                  let updatedSelected;
                  if (exists) {
                    updatedSelected = selectedLabels.filter(l => l.id !== label.id);
                  } else {
                    updatedSelected = [...selectedLabels, label];
                  }
                  onChange(updatedSelected);
                  if (onLabelClick) {
                    onLabelClick(label);
                  }
                }}
                style={{
                  backgroundColor: selected ? label.color : 'transparent',
                  color: selected ? '#fff' : label.color,
                  borderColor: label.color,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  borderStyle: 'solid',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                aria-pressed={selected}
              >
                {label.name}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLabel(label.id)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
                aria-label={`Delete label ${label.name}`}
                title={`Delete label ${label.name}`}
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="New label name"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
          className={`flex-grow p-1 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
        />
        <input
          type="color"
          value={newLabelColor}
          onChange={(e) => setNewLabelColor(e.target.value)}
          title="Pick label color"
          className="w-8 h-8 p-0 border-0 cursor-pointer"
        />
        <button
          type="button"
          onClick={handleAddLabel}
          disabled={loading || !newLabelName.trim()}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default LabelSelector;
