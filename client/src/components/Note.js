import React, { useState, useEffect } from 'react';
import { Pin } from 'lucide-react';
import ListItemsDisplay from './ListItemsDisplay';
import SimpleNoteDisplay from './SimpleNoteDisplay';
import DrawingNoteCardDisplay from './DrawingNoteCardDisplay';
import DrawingCanvas from './DrawingCanvas';
import ImageNoteCardDisplay from './ImageNoteCardDisplay';
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

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsNote, setDetailsNote] = useState(null);
  const [isPinned, setIsPinned] = useState(pinned || false);
  const [listItems, setListItems] = useState(props.listItems || []);
  const [imageDataState, setImageDataState] = useState(imageData ? (Array.isArray(imageData) ? imageData : [imageData]) : []);
  const [drawingDataState, setDrawingDataState] = useState(drawingData || null);
  const [noteColor, setNoteColor] = useState(color || (darkMode ? '#1e293b' : '#ffffff'));
  const fileInputRef = React.useRef(null);

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
    setIsPinned(pinned || false);
  }, [pinned]);

  useEffect(() => {
    setDrawingDataState(drawingData || null);
  }, [drawingData]);

  useEffect(() => {
    setNoteColor(color || (darkMode ? '#1e293b' : '#ffffff'));
  }, [color, darkMode]);

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

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    onUpdate(id, { pinned: newPinned ? 1 : 0 });
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
        {isPinned && (
          <div className="absolute top-3 right-3 bg-gray-400 rounded-full p-1 shadow-md cursor-pointer" onClick={togglePin} title={isPinned ? 'Unpin note' : 'Pin note'}>
            <Pin size={20} className="text-white" />
          </div>
        )}
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <h3 className={`font-bold text-lg break-words ${getTextColor(color)}`}>
              {title || "Untitled Note"}
            </h3>
          </div>
          {type === 'note' && (
            <SimpleNoteDisplay content={content} textColor={getTextColor(color)} searchTerm={searchTerm} />
          )}
          {type === 'list' && (
            <ListItemsDisplay listItems={listItems} onListItemsChange={() => {}} darkMode={darkMode} isEditing={false} searchTerm={searchTerm} />
          )}
          {type === 'drawing' && (
            <DrawingNoteCardDisplay
              drawingData={drawingDataState}
              content={content}
              textColor={getTextColor(color)}
              isEditing={false}
              onDrawingChange={() => {}}
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
              textColor={getTextColor(color)}
              isEditing={false}
              onImageChange={() => {}}
              searchTerm={searchTerm}
            />
          )}
          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <p className={`text-xs ${getTextColor(color).replace('text-gray-800', 'text-gray-600').replace('text-gray-300', 'text-gray-500')}`}>
              {formatDate(createdAt)}
            </p>
          </div>
        </div>
      </div>
      <NoteDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        note={detailsNote}
        darkMode={darkMode}
        searchTerm={searchTerm}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );

  function formatDate(dateString) {
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
  }

  function getTextColor(bgColor) {
    if (!bgColor || bgColor === '#ffffff') return darkMode ? 'text-gray-700' : 'text-gray-900';

    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 150 ? 'text-gray-900' : 'text-gray-100';
  }
}

export default Note;
