import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Save, XCircle, Pin } from 'lucide-react';
import ListItemsDisplay from './ListItemsDisplay';
import SimpleNoteDisplay from './SimpleNoteDisplay';
import DrawingNoteCardDisplay from './DrawingNoteCardDisplay';
import DrawingCanvas from './DrawingCanvas';
import ImageNoteCardDisplay from './ImageNoteCardDisplay';
import Modal from './Modal';
import NoteDetailsModal from './NoteDetailsModal';

function Note(props) {
  const { id, title, content, createdAt, pinned, color, onDelete, onUpdate, darkMode, type, drawingData, imageData, isGridView, searchTerm } = props;

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [isPinned, setIsPinned] = useState(pinned || false);
  const [listItems, setListItems] = useState(props.listItems || []);
  const [imageDataState, setImageDataState] = useState(imageData ? (Array.isArray(imageData) ? imageData : [imageData]) : []);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsNote, setDetailsNote] = useState(null);
  const fileInputRef = React.useRef(null);
  const [noteColor, setNoteColor] = useState(color || (darkMode ? '#1e293b' : '#ffffff'));

  useEffect(() => {
    if (imageData) {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(img => typeof img === 'string' && img.trim() !== '');
          setImageDataState(filtered);
        } else {
          setImageDataState([imageData]);
        }
      } catch {
        setImageDataState([imageData]);
      }
    } else {
      setImageDataState([]);
    }
  }, [imageData]);

  const [drawingDataState, setDrawingDataState] = useState(drawingData || null);
  const [drawingColor, setDrawingColor] = useState('#000000');

  useEffect(() => {
    if (type === 'list') {
      if (props.listItems && props.listItems.length > 0) {
        setListItems(props.listItems);
      } else {
        setListItems([]);
      }
    } else {
      setListItems([]);
    }
  }, [props.listItems, type]);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  useEffect(() => {
    setIsPinned(pinned || false);
  }, [pinned]);
  
  useEffect(() => {
    setDrawingDataState(drawingData || null);
  }, [drawingData]);

  useEffect(() => {
    setNoteColor(color || (darkMode ? '#1e293b' : '#ffffff'));
  }, [color, darkMode]);

  const handleDelete = () => onDelete(id);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    resetEditedFields();
  };

  const openDetailsModal = () => {
    setDetailsNote({
      id,
      title,
      content,
      pinned,
      color,
      type,
      listItems,
      drawingData,
      imageData,
    });
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setDetailsNote(null);
  };

  const resetEditedFields = () => {
    setEditedTitle(title);
    setEditedContent(content);
    setIsPinned(pinned || false);
    if (imageData) {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          setImageDataState(parsed);
        } else {
          setImageDataState([imageData]);
        }
      } catch {
        setImageDataState([imageData]);
      }
    } else {
      setImageDataState([]);
    }
    if (type === 'list' && content) {
      const items = content.split('\n').filter(line => line.trim() !== '').map((line, index) => {
        let checked = false;
        let text = line;
        const match = line.match(/^\s*\[(x| )\]\s*(.*)/i);
        if (match) {
          checked = match[1].toLowerCase() === 'x';
          text = match[2];
        }
        return {
          id: index,
          text,
          checked
        };
      });
      setListItems(items);
    }
  };

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    onUpdate(id, { pinned: newPinned ? 1 : 0 });
  };

  const handleSave = () => {
    if (editedTitle.trim() === '' && editedContent.trim() === '' && type !== 'drawing' && type !== 'image') {
      return;
    }

    const updateData = {
      title: editedTitle,
      pinned: isPinned ? 1 : 0,
      color: noteColor,
    };

    if (type === 'list') {
      updateData.content = editedContent;
      updateData.listItems = listItems;
    } else if (type === 'drawing') {
      updateData.drawing_data = drawingDataState;
      updateData.content = editedContent;
    } else if (type === 'image') {
      updateData.image_url = JSON.stringify(imageDataState);
      updateData.content = editedContent;
    } else {
      updateData.content = editedContent;
    }

    onUpdate(id, updateData);
    setIsModalOpen(false);
  };

  const toggleListItemChecked = (itemId) => {
    const updatedItems = listItems.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    handleListItemsChange(updatedItems);
  };

  const handleListItemsChange = (updatedItems) => {
    setListItems(updatedItems);

    // Convert listItems to content string with check marks for saving
    const updatedContentForSave = updatedItems.map(item => {
      const prefix = item.checked ? '[x] ' : '[ ] ';
      return prefix + item.text;
    }).join('\n');
    setEditedContent(updatedContentForSave);
  };

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return 'Date unknown';
    }

    let safeDateString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
    let dateObj = new Date(safeDateString);
    if (isNaN(dateObj.getTime())) {
      safeDateString = dateString.replace(' ', 'T') + 'Z';
      dateObj = new Date(safeDateString);
    }
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTextColor = (bgColor) => {
    if (!bgColor || bgColor === '#ffffff') return darkMode ? 'text-gray-700' : 'text-gray-900';

    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 150 ? 'text-gray-900' : 'text-gray-100';
  };

  const textColor = getTextColor(color);

  const renderEditContent = () => {
    return (
      <div className="flex flex-col h-full">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
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
                initialDrawingData={drawingDataState}
                onSave={(newDrawingData) => {
                  setDrawingDataState(newDrawingData);
                }}
                darkMode={darkMode}
              />
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={`resize-none p-2 rounded border mt-2 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-900'
              }`}
              placeholder="Add a note about the drawing..."
              rows={3}
            />
          </div>
      ) : type === 'image' ? (
        <div className="flex space-x-4 h-full">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className={`flex-grow resize-none p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
            placeholder="Edit your note content here..."
            style={{ minHeight: '200px' }}
          />
          <div className="flex flex-col space-y-2 max-h-[300px] overflow-y-auto w-48">
              {imageDataState.filter(imgSrc => imgSrc && imgSrc.trim() !== '').map((imgSrc, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                  <img
                    src={imgSrc}
                    alt={`Note attachment ${index + 1}`}
                    className="w-full h-auto max-h-40 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.textContent = 'Image failed to load';
                      fallback.style.color = 'red';
                      e.target.parentNode.appendChild(fallback);
                    }}
                  />
                  <button
                    onClick={() => {
                      const newImages = imageDataState.filter((_, i) => i !== index);
                      setImageDataState(newImages);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
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
                  setImageDataState(prev => [...prev, ...images]);
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
          </div>
        </div>
      ) : (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
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
              onClick={closeModal}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-full shadow-md transition-colors flex items-center dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
            >
              <XCircle size={18} className="mr-1" />
              <span className="text-xs">Cancel</span>
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
                className={`
                  w-8 h-8 rounded-full border-2 transition-transform
                  ${noteColor === colorOption.bg ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : 'scale-100 hover:scale-110'}
                `}
                style={{
                  backgroundColor: colorOption.bg,
                  borderColor: colorOption.border
                }}
                aria-label={`Select color ${colorOption.bg}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNoteContent = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`font-bold text-lg break-words ${textColor}`}>
            {title || "Untitled Note"}
          </h3>
        </div>
        {type === 'note' && (
          <SimpleNoteDisplay content={content} textColor={textColor} searchTerm={searchTerm} />
        )}
        {type === 'list' && (
          <ListItemsDisplay listItems={listItems} onListItemsChange={handleListItemsChange} darkMode={darkMode} isEditing={false} searchTerm={searchTerm} />
        )}
        {type === 'drawing' && (
          <DrawingNoteCardDisplay
            drawingData={drawingDataState}
            content={editedContent}
            textColor={textColor}
            isEditing={false}
            onDrawingChange={(newDrawingData) => {
              setDrawingDataState(newDrawingData);
              onUpdate(id, { drawing_data: newDrawingData });
            }}
            searchTerm={searchTerm}
          />
        )}
        {type === 'image' && (
          <ImageNoteCardDisplay
            imageData={
              (() => {
                try {
                  const parsed = JSON.parse(imageDataState);
                  if (Array.isArray(parsed)) {
                    return parsed.filter(img => typeof img === 'string' && img.trim() !== '');
                  }
                  return [imageDataState];
                } catch {
                  return imageDataState;
                }
              })()
            }
            content={content}
            textColor={textColor}
            isEditing={false}
            onImageChange={setImageDataState}
            searchTerm={searchTerm}
          />
        )}
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <p className={`text-xs ${textColor.replace('text-gray-800', 'text-gray-600').replace('text-gray-300', 'text-gray-500')}`}>
            {formatDate(createdAt)}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={openModal}
              className={`p-2 rounded-full transition-colors ${darkMode
                ? 'text-blue-400 hover:bg-blue-900/30'
                : 'text-blue-500 hover:bg-blue-100'
              }`}
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={handleDelete}
              className={`p-2 rounded-full transition-colors ${darkMode
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-red-500 hover:bg-red-100'
              }`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`relative rounded-xl p-5 flex flex-col justify-between transition-all duration-200 break-inside-avoid
                   shadow-lg hover:shadow-xl ${darkMode
          ? 'border border-gray-700'
          : 'border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
        }`}
        style={{
          backgroundColor: color || (darkMode ? '#1e1e1e' : '#ffffff'),
          minHeight: '200px',
          maxWidth: isGridView ? '280px' : '100%',
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'hidden',
          marginBottom: '0.75rem',
          cursor: 'pointer',
        }}
        onClick={openDetailsModal}
      >
        {isPinned && !isModalOpen && (
          <div className="absolute top-3 right-3 bg-gray-400 rounded-full p-1 shadow-md cursor-pointer" onClick={togglePin} title={isPinned ? 'Unpin note' : 'Pin note'}>
            <Pin size={20} className="text-white" />
          </div>
        )}
        {renderNoteContent()}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Note">
        {renderEditContent()}
      </Modal>
      <NoteDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        note={detailsNote}
        darkMode={darkMode}
        searchTerm={searchTerm}
      />
    </>
  );
}

export default Note;
