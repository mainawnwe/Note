import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import SimpleNoteDisplay from './SimpleNoteDisplay';
import ListItemsDisplay from './ListItemsDisplay';
import DrawingNoteCardDisplay from './DrawingNoteCardDisplay';
import DrawingCanvas from './DrawingCanvas';
import ImageNoteCardDisplay from './ImageNoteCardDisplay';
import { Pin, Save, XCircle, Trash2 } from 'lucide-react';
import LabelSelector from './LabelSelector';

function NoteDetailsModal({ isOpen, onClose, note, darkMode, searchTerm, onUpdate, onDelete }) {
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
    labels: initialLabels = [],
  } = note || {};

  // Utility function to determine if a color is light or dark
  // Calculate relative luminance of a color
  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  // Calculate contrast ratio between two luminances
  const getContrastRatio = (lum1, lum2) => {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const isColorLight = (color) => {
    if (!color) return true;
    const c = color.charAt(0) === '#' ? color.substring(1) : color;
    const hex = c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const bgLuminance = getLuminance(r, g, b);
    const whiteLuminance = getLuminance(255, 255, 255);
    const blackLuminance = getLuminance(0, 0, 0);
    const contrastWithWhite = getContrastRatio(bgLuminance, whiteLuminance);
    const contrastWithBlack = getContrastRatio(bgLuminance, blackLuminance);
    // Return true if white text has better contrast, else false
    return contrastWithWhite >= contrastWithBlack;
  };

  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [listItems, setListItems] = useState(initialListItems || []);
  const [drawingData, setDrawingData] = useState(initialDrawingData || null);
  const [drawingColor, setDrawingColor] = useState('#000000'); // default drawing color
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
  const [selectedLabels, setSelectedLabels] = useState(initialLabels);

  // Determine if color is dark or black
  const isColorDarkOrBlack = (color) => {
    if (!color) return false;
    const c = color.charAt(0) === '#' ? color.substring(1) : color;
    const hex = c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Consider black or dark if luminance below 0.15
    return luminance < 0.15;
  };

  const textColor = isColorDarkOrBlack(noteColor) ? '#ffffff' : '#000000';

  // Override: if no background color, always black text
  if (!noteColor) {
    textColor = '#000000';
  }

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
    setDrawingColor('#000000'); // reset to default or could be extended to load from note if stored
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
  }, [initialImageData]); // Added dependency array to prevent infinite loop

  useEffect(() => {
    setIsPinned(initialPinned || false);
  }, [initialPinned]);

  useEffect(() => {
    setNoteColor(initialColor || (darkMode ? '#1e293b' : '#ffffff'));
  }, [initialColor, darkMode]);

  useEffect(() => {
    setSelectedLabels(initialLabels);
  }, [initialLabels]);

  // Fix: Add dependency array to prevent infinite re-render

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
      labels: selectedLabels.map(label => label.id),
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

    // Ensure labels are included as array of label IDs to preserve them
    if (selectedLabels && selectedLabels.length > 0) {
      updateData.labels = selectedLabels.map(label => label.id);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Note" contentStyle={{ backgroundColor: noteColor, color: textColor }}>
      <div className="flex flex-col h-full p-4 space-y-4" style={{ color: textColor }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ color: textColor, backgroundColor: noteColor }}
          className={`font-bold text-xl mb-2 p-2 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none border`}
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
                drawingColor={drawingColor}
                showControls={true}
              />
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <label htmlFor="drawingColor" className="text-sm font-semibold">
                Drawing Color:
              </label>
              <input
                id="drawingColor"
                type="color"
                value={drawingColor}
                onChange={(e) => setDrawingColor(e.target.value)}
                className="w-10 h-8 p-0 border-0 cursor-pointer"
                title="Select drawing color"
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ color: textColor, backgroundColor: noteColor }}
              className={`resize-none p-2 rounded border mt-2 ${darkMode
                ? 'border-gray-600'
                : 'border-gray-300'
              }`}
              placeholder="Add a note about the drawing..."
              rows={3}
            />
          </div>
        ) : type === 'image' ? (
          <>
            <ImageNoteCardDisplay
              imageData={imageData}
              content={content}
              textColor={darkMode ? 'text-white' : 'text-gray-900'}
              isEditing={true}
              onImageChange={handleImageChange}
              searchTerm={searchTerm}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const readers = files.map(file => {
                  return new Promise((resolve, reject) => {
                    if (!file.type.match('image.*')) {
                      reject('Invalid file type');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                  });
                });
                Promise.all(readers).then(images => {
                  setImageData(prev => [...prev, ...images]);
                }).catch(() => {
                  alert('Some files were not valid images.');
                });
                e.target.value = null;
              }}
              accept="image/*"
              className="hidden"
              multiple
              aria-hidden="true"
            />
          </>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ color: textColor, backgroundColor: noteColor }}
            className={`flex-grow resize-none p-2 rounded border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
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
      <div className="mt-4" style={{ color: textColor }}>
        <div className="mb-2">
          <span className="text-sm font-semibold">Background Color:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((colorOption, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setNoteColor(colorOption.bg)}
            className={"w-8 h-8 rounded-full border-2 transition-transform " + (noteColor === colorOption.bg ? "scale-110 ring-2 ring-offset-2 ring-blue-500" : "scale-100 hover:scale-110")}
              style={{
                backgroundColor: colorOption.bg,
                borderColor: colorOption.border
              }}
              aria-label={"Select color " + colorOption.bg}
            />
          ))}
        </div>
        {/* Label selector */}
        <div className="mt-4">
          <LabelSelector
            selectedLabels={selectedLabels}
            onChange={setSelectedLabels}
            darkMode={darkMode}
          />
        </div>
      </div>
      </div>
    </Modal>
  );
}

export default NoteDetailsModal;
