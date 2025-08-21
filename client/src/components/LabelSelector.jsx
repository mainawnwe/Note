import React, { useState, useRef } from 'react';
import useLabels from '../hooks/useLabels';
import { Plus, X, Hash, Palette, Check } from 'lucide-react';

function LabelSelector({ 
  selectedLabels, 
  onChange, 
  darkMode, 
  onLabelClick,
  showCreateForm = true,
  maxLabels = 0,
  size = 'md'
}) {
  const { labels, loading, error, addLabel, deleteLabel } = useLabels();
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#a7f3d0'); // default greenish
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef(null);
  
  // Focus input when adding mode is enabled
  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);
  
  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    
    try {
      setIsAdding(true);
      const newLabel = await addLabel(newLabelName.trim(), newLabelColor);
      onChange([...selectedLabels, newLabel]);
      setNewLabelName('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      setIsAdding(false);
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
  
  const toggleLabelSelection = (label) => {
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
  };
  
  // Handle Enter key in input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    }
  };
  
  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-3 py-2'
  };
  
  // Get text color based on background
  const getTextColor = (bgColor, isSelected) => {
    if (isSelected) return 'text-white';
    
    if (!bgColor) return darkMode ? 'text-gray-300' : 'text-gray-700';
    
    // Simple check for dark backgrounds
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? 'text-gray-900' : 'text-gray-100';
  };
  
  // Determine how many labels to show
  const labelsToShow = maxLabels > 0 && labels.length > maxLabels 
    ? labels.slice(0, maxLabels) 
    : labels;
  
  const remainingCount = labels.length - labelsToShow.length;

  return (
    <div className={`label-selector ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Hash className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          <h3 className={`font-semibold ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
            Labels
          </h3>
          {selectedLabels.length > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              {selectedLabels.length} selected
            </span>
          )}
        </div>
        
        {showCreateForm && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
              darkMode 
                ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        )}
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="flex items-center justify-center py-3">
          <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 ${
            darkMode ? 'border-teal-400' : 'border-teal-600'
          }`}></div>
          <span className="ml-2 text-sm">Loading labels...</span>
        </div>
      )}
      
      {error && (
        <div className={`mb-3 p-3 rounded-lg text-sm ${
          darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
        }`}>
          {error}
        </div>
      )}
      
      {/* Labels grid */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {labelsToShow.map((label) => {
            const selected = selectedLabels.some(l => l.id === label.id);
            const textColorClass = getTextColor(label.color, selected);
            
            return (
              <div key={label.id} className="flex items-center group">
                <button
                  type="button"
                  onClick={() => toggleLabelSelection(label)}
                  className={`
                    flex items-center space-x-1 rounded-full transition-all duration-200
                    hover:shadow-md hover:scale-105
                    ${sizeClasses[size]}
                    ${selected ? 'ring-2 ring-offset-2' : ''}
                    ${darkMode ? 'ring-offset-gray-900' : 'ring-offset-white'}
                  `}
                  style={{
                    backgroundColor: selected ? label.color : 'transparent',
                    color: selected ? '#fff' : label.color,
                    borderColor: label.color,
                    borderWidth: selected ? '0' : '1px',
                  }}
                  aria-pressed={selected}
                >
                  {!selected && (
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: label.color }}
                    ></div>
                  )}
                  <span className="font-medium truncate max-w-[100px]">
                    {label.name}
                  </span>
                  {selected && (
                    <Check className="w-3 h-3" />
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleDeleteLabel(label.id)}
                  className={`
                    ml-1 rounded-full p-1 opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                    ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}
                  `}
                  aria-label={`Delete label ${label.name}`}
                  title={`Delete label ${label.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          
          {/* Show remaining count if there are more labels */}
          {remainingCount > 0 && (
            <div
              className={`
                inline-flex items-center justify-center rounded-full font-medium
                ${sizeClasses[size]}
                ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
              `}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      )}
      
      {/* Create new label form */}
      {showCreateForm && isAdding && (
        <div className={`p-4 rounded-xl mb-4 transition-all duration-300 ${
          darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100/80 border border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <Palette className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className="text-sm font-medium">Create new label</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Label name"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-grow px-3 py-2 rounded-lg border outline-none transition-all ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-teal-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500'
              }`}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                title="Pick label color"
                className="w-10 h-10 p-1 border-0 rounded-lg cursor-pointer bg-transparent"
              />
              
              <button
                type="button"
                onClick={handleAddLabel}
                disabled={!newLabelName.trim()}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${!newLabelName.trim()
                    ? darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode 
                      ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }
                `}
              >
                Add
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewLabelName('');
                }}
                className={`
                  px-3 py-2 rounded-lg font-medium transition-all
                  ${darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }
                `}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && labels.length === 0 && (
        <div className={`text-center py-6 rounded-xl ${
          darkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'
        }`}>
          <Hash className={`w-8 h-8 mx-auto mb-2 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No labels yet. Create your first label to organize your notes.
          </p>
        </div>
      )}
    </div>
  );
}

export default LabelSelector;