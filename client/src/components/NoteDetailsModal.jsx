import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import SimpleNoteDisplay from './SimpleNoteDisplay';
import ListItemsDisplay from './ListItemsDisplay';
import DrawingNoteCardDisplay from './DrawingNoteCardDisplay';
import DrawingCanvas from './DrawingCanvas';
import ImageNoteCardDisplay from './ImageNoteCardDisplay';
import { Pin, Save, XCircle, Trash2 } from 'lucide-react';

function NoteDetailsModal({ isOpen, onClose, note, darkMode, searchTerm, onUpdate, onDelete }) {
  if (!note) return null;

  const {
    id,
    title: initialTitle,
    content: initialContent,
    type,
    listItems: initialListItems,
    drawingData: initialDrawingData,
    imageData: initialImageData,
    pinned: initialPinned,
    color: initialColor,
  } = note;

  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [listItems, setListItems] = useState(initialListItems || []);
  const [drawingData, setDrawingData] = useState(initialDrawingData || null);
  const [imageData, setImageData] = useState(() => {
    if (!initialImageData) return [];
    try {
      const parsed = JSON.parse(initialImageData);
      if (Array.isArray(parsed)) {
        return parsed.filter(img => typeof img === 'string' && img.trim() !== '');
      }
      return [initialImageData];
    } catch {
      return [initialImageData];
    }
  });
  const [isPinned, setIsPinned] = useState(initialPinned || false);
  const [noteColor, setNoteColor] = useState(initialColor || (darkMode ? '#1e293b' : '#ffffff'));

  useEffect(() => {
    setTitle(initialTitle || '');
  }, [initialTitle]);

  useEffect(() => {
    setContent(initialContent || '');
  }, [initialContent]);

  useEffect(() => {
    setListItems(initialListItems || []);
  }, [initialListItems]);

  useEffect(() => {
    setDrawingData(initialDrawingData || null);
  }, [initialDrawingData]);

  useEffect(() => {
    setImageData(() => {
      if (!initialImageData) return [];
      try {
        const parsed = JSON.parse(initialImageData);
        if (Array.isArray(parsed)) {
          return parsed.filter(img => typeof img === 'string' && img.trim() !== '');
        }
        return [initialImageData];
      } catch {
        return [initialImageData];
      }
    });
  }, [initialImageData]);

  useEffect(() => {
    setIsPinned(initialPinned || false);
  }, [initialPinned]);

  useEffect(() => {
    setNoteColor(initialColor || (darkMode ? '#1e293b' : '#ffffff'));
  }, [initialColor, darkMode]);

  const fileInputRef = useRef(null);

  const colors = [
    { bg: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '#334155' : '#e2e8f0' },
    { bg: '#fecaca', border: '#fca5a5' },
    { bg: '#fed7aa', border: '#fdba74' },
    { bg: '#fef08a', border: '#fde047' },
    { bg: '#d9f99d', border: '#bef264' },
    { bg: '#a7f3d0', border: '#6ee7b7' },
    { bg: '#bae6fd', border: '#7dd3fc' },
    { bg: '#c7d2fe', border: '#a5b4fc' },
    { bg: '#e9d5ff', border: '#d8b4fe' },
  ];

  const handleSave = () => {
    if (title.trim() === '' && content.trim() === '' && type !== 'drawing' && type !== 'image') {
      return;
    }

    const updateData = {
      title,
      pinned: isPinned ? 1 : 0,
      color: noteColor,
    };

    if (type === 'list') {
      updateData.content = content;
      updateData.listItems = listItems;
    } else if (type === 'drawing') {
      updateData.drawing_data = drawingData;
      updateData.content = content;
    } else if (type === 'image') {
      updateData.image_url = JSON.stringify(imageData);
      updateData.content = content;
    } else {
      updateData.content = content;
    }

    onUpdate(id, updateData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDelete = () => {
    onDelete(id);
    onClose();
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  const handleListItemsChange = (updatedItems) => {
    setListItems(updatedItems);

    // Convert listItems to content string with check marks for saving
    const updatedContentForSave = updatedItems.map(item => {
      const prefix = item.checked ? '[x] ' : '[ ] ';
      return prefix + item.text;
    }).join('\n');
    setContent(updatedContentForSave);
  };

  const handleImageChange = (newImageData) => {
    setImageData(newImageData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Note">
      <div className="flex flex-col h-full max-h-[80vh] overflow-y-auto p-4 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`font-bold text-xl mb-2 p-2 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none ${darkMode
            ? 'bg-gray-800 text-white border-gray-700'
            : 'bg-white text-gray-900 border-gray-300'
          } border`}
          placeholder="Title"
        />
        {type === 'list' ? (
          <ListItemsDisplay
            listItems={listItems}
            onListItemsChange={handleListItemsChange}
            darkMode={darkMode}
            isEditing={true}
            searchTerm={searchTerm}
          />
        ) : type === 'drawing' ? (
          <div className="flex flex-col flex-grow">
            <div className="h-64">
              <DrawingCanvas
                initialDrawingData={drawingData}
                onSave={setDrawingData}
                darkMode={darkMode}
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`resize-none p-2 rounded border mt-2 ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-900'
              }`}
              placeholder="Add a note about the drawing..."
              rows={3}
            />
          </div>
        ) : type === 'image' ? (
          <ImageNoteCardDisplay
            imageData={imageData}
            content={content}
            textColor={darkMode ? 'text-white' : 'text-gray-900'}
            isEditing={true}
            onImageChange={handleImageChange}
            searchTerm={searchTerm}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`flex-grow resize-none p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
            placeholder="Edit your note content here..."
          />
        )}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={togglePin}
            className={`p-2 rounded-full transition-colors ${isPinned
              ? 'bg-amber-300 text-amber-800 dark:bg-amber-600 dark:text-amber-100'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={18} />
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-colors flex items-center"
            >
              <Save size={18} className="mr-1" />
              <span className="text-xs">Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-full shadow-md transition-colors flex items-center dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
            >
              <XCircle size={18} className="mr-1" />
              <span className="text-xs">Cancel</span>
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors flex items-center"
            >
              <Trash2 size={18} className="mr-1" />
              <span className="text-xs">Delete</span>
            </button>
          </div>
        </div>
        {/* Color picker */}
        <div className="mt-4">
          <div className="mb-2">
            <span className="text-sm font-semibold">Background Color:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((colorOption, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setNoteColor(colorOption.bg)}
                className={\`
                  w-8 h-8 rounded-full border-2 transition-transform
                  \${noteColor === colorOption.bg ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : 'scale-100 hover:scale-110'}
                \`}
                style={{
                  backgroundColor: colorOption.bg,
                  borderColor: colorOption.border
                }}
                aria-label={\`Select color \${colorOption.bg}\`}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default NoteDetailsModal;
