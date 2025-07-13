import React, { useState, useEffect } from 'react';

function LabelSelector({ selectedLabels, onChange, darkMode, onLabelsChange, onLabelClick }) {
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#a7f3d0'); // default greenish
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/labels.php');
      if (!response.ok) throw new Error('Failed to fetch labels');
      const data = await response.json();
      setLabels(data);
      if (onLabelsChange) {
        onLabelsChange(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('LabelSelector selectedLabels changed:', selectedLabels);
  }, [selectedLabels]);

  useEffect(() => {
    fetchLabels();
  }, []);

  // Remove toggleLabel function since we will use onLabelClick for label clicks

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/labels.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLabelName.trim(), color: newLabelColor }),
      });
      if (!response.ok) throw new Error('Failed to create label');
      const result = await response.json();
      if (result.id) {
        const newLabel = { id: result.id, name: newLabelName.trim(), color: newLabelColor };
        const updatedLabels = [...labels, newLabel];
        setLabels(updatedLabels);
        onChange([...selectedLabels, newLabel]);
        if (onLabelsChange) {
          onLabelsChange(updatedLabels);
        }
        setNewLabelName('');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteLabel = async (labelId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/labels.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${encodeURIComponent(labelId)}`,
      });
      if (!response.ok) throw new Error('Failed to delete label');
      // Remove deleted label from state
      const updatedLabels = labels.filter(label => label.id !== labelId);
      setLabels(updatedLabels);
      onChange(selectedLabels.filter(label => label.id !== labelId));
      if (onLabelsChange) {
        onLabelsChange(updatedLabels);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
                className={`px-3 py-1 rounded-full border cursor-pointer select-none transition-colors ${
                  selected
                    ? `bg-[${label.color}] text-white border-transparent`
                    : `bg-transparent text-[${label.color}] border-[${label.color}] hover:bg-[${label.color}] hover:text-white`
                }`}
                style={{
                  backgroundColor: selected ? label.color : 'transparent',
                  color: selected ? '#fff' : label.color,
                  borderColor: label.color,
                }}
                aria-pressed={selected}
              >
                {label.name}
              </button>
              <button
                type="button"
                onClick={() => deleteLabel(label.id)}
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
