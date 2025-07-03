import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, X } from 'lucide-react';

function ListItemsDisplay({ listTitle, listItems, onListItemsChange, darkMode, isEditing, searchTerm }) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [items, setItems] = useState(listItems || []);
  const [undoStack, setUndoStack] = useState([]);
  const [undoMessage, setUndoMessage] = useState('');
  const undoTimeoutRef = useRef(null);

  useEffect(() => {
    setItems(listItems || []);
  }, [listItems]);


  const saveStateForUndo = (message) => {
    setUndoStack(prev => [...prev, items]);
    setUndoMessage(message);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => {
      setUndoStack([]);
      setUndoMessage('');
    }, 5000);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setItems(previous);
    onListItemsChange(previous);
    setUndoMessage('Undo performed');
  };

  const toggleChecked = (id) => {
    saveStateForUndo('Item checked/unchecked');
    const updated = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setItems(updated);
    onListItemsChange(updated);
  };

  const updateText = (id, text) => {
    const updated = items.map(item => item.id === id ? { ...item, text } : item);
    setItems(updated);
    onListItemsChange(updated);
  };

  const deleteItem = (id) => {
    saveStateForUndo('Item deleted');
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    onListItemsChange(updated);
  };

  const addItem = () => {
    saveStateForUndo('Item added');
    const newItem = { id: Date.now(), text: '', checked: false };
    setItems([...items, newItem]);
    onListItemsChange([...items, newItem]);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    } else if (e.key === 'Backspace') {
      const item = items.find(i => i.id === id);
      if (item && item.text === '') {
        e.preventDefault();
        deleteItem(id);
      }
    }
  };

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  return (
    <div className={`rounded-md p-4 w-full max-w-xs transition-all border ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
      <h3 className="text-md font-semibold mb-3">{listTitle}</h3>
      <div className="space-y-1">
        {uncheckedItems.map((item) => (
          <div key={item.id} className="flex items-center">
            <button
              onClick={() => toggleChecked(item.id)}
              className={`mr-2 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                item.checked
                  ? 'bg-green-500 border-green-500'
                  : darkMode
                  ? 'border-gray-400 bg-gray-700'
                  : 'border-gray-400 bg-white'
              }`}
              aria-label={item.checked ? 'Uncheck item' : 'Check item'}
              type="button"
            >
              {item.checked && <CheckCircle size={16} className="text-white" strokeWidth={2} />}
            </button>
            {isEditing ? (
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateText(item.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className={`flex-grow bg-transparent border-none p-0 m-0 focus:outline-none focus:ring-0 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}
                placeholder="Add item..."
                aria-label="Edit item"
              />
            ) : (
              <span className={`flex-grow ${item.checked ? 'line-through text-gray-500' : darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                {highlightText(item.text, searchTerm)}
              </span>
            )}
            <button
              onClick={() => deleteItem(item.id)}
              className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
              aria-label="Delete item"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {isEditing && (
          <button
            onClick={addItem}
            className="mt-2 w-full text-left text-blue-500 hover:underline focus:outline-none"
            type="button"
          >
            + Add item
          </button>
        )}
      </div>

      {checkedItems.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-expanded={showCompleted}
            aria-controls="completed-items"
          >
            {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="ml-1">{checkedItems.length} Completed item{checkedItems.length > 1 ? 's' : ''}</span>
          </button>
          {showCompleted && (
            <div id="completed-items" className="mt-1 space-y-1 pl-4 border-l border-gray-400 dark:border-gray-600">
              {checkedItems.map((item) => (
                <div key={item.id} className="flex items-center opacity-70">
                  <button
                    onClick={() => toggleChecked(item.id)}
                    className={`
                      mr-2 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500
                      bg-green-500 border-green-500
                    `}
                    aria-label="Uncheck item"
                    type="button"
                  >
                    <CheckCircle size={16} className="text-white" strokeWidth={2} />
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateText(item.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    className="flex-grow bg-transparent border-none p-0 m-0 focus:outline-none focus:ring-0 line-through text-gray-500 opacity-70"
                    aria-label="Edit completed item"
                  />
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                    aria-label="Delete completed item"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {undoMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-md flex items-center space-x-4">
          <span>{undoMessage}</span>
          <button
            onClick={undo}
            className="underline hover:text-gray-300 focus:outline-none"
            type="button"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );

  function highlightText(text, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return text;
    }
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: '#a52a2a', color: 'white' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  }
}

export default ListItemsDisplay;
