import React, { useState, useEffect, useRef } from 'react';
import { Type, List, PenTool, Camera, Send, X, Pin, Plus, CheckCircle, MoreHorizontal, ChevronDown, Clock, User, Bold, Italic, Underline, Trash2, Tag } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DrawingCanvas from './DrawingCanvas';
import ImageUpload from './ImageUpload';
import EditLabelsModal from './EditLabelsModal';

export default function CreateArea({ onAdd, darkMode, onLabelsChange, onLabelClick, currentLabel, allLabels, setAllLabels }) {
  const [note, setNote] = useState({
    title: '',
    content: '',
    color: darkMode ? '#1e293b' : '#ffffff',
    pinned: false,
    type: 'note',
    listItems: [],
    drawingDataUrl: null,
    imageData: null,
    imageUrl: null,
    drawingColor: '#000000',
  });

  const [selectedLabels, setSelectedLabels] = useState([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [editLabelsModalOpen, setEditLabelsModalOpen] = useState(false);
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const moreOptionsRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreOptionsOpen, isExpanded, note.title, note.content, note.type]);

  const handleClickOutside = (e) => {
    if (moreOptionsRef.current && !moreOptionsRef.current.contains(e.target) &&
        formRef.current && !formRef.current.contains(e.target)) {
      setMoreOptionsOpen(false);
      if (note.title.trim() === '' && note.content.trim() === '' && note.type === 'note') {
        setIsExpanded(false);
      }
    } else if (moreOptionsRef.current && !moreOptionsRef.current.contains(e.target)) {
      setMoreOptionsOpen(false);
    }
  };

  const handleNoteTypeChange = (type) => {
    setNote({
      title: '',
      content: '',
      color: note.color,
      pinned: false,
      type,
      listItems: type === 'list' ? [{ id: Date.now(), text: '', checked: false }] : [],
      drawingDataUrl: null,
      imageData: null,
      imageUrl: null,
      drawingColor: '#000000',
    });
    setIsExpanded(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote(prev => ({ ...prev, [name]: value }));
  };

  const togglePin = () => {
    setNote(prev => ({ ...prev, pinned: !prev.pinned }));
  };

  const addListItem = () => {
    setNote(prev => ({
      ...prev,
      listItems: [...prev.listItems, { id: Date.now(), text: '', checked: false }]
    }));
  };

  const updateListItem = (id, value) => {
    setNote(prev => ({
      ...prev,
      listItems: prev.listItems.map(item => 
        item.id === id ? { ...item, text: value } : item
      )
    }));
  };

  const toggleCheckItem = (id) => {
    setNote(prev => ({
      ...prev,
      listItems: prev.listItems.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const removeListItem = (id) => {
    setNote(prev => ({
      ...prev,
      listItems: prev.listItems.filter(item => item.id !== id)
    }));
  };

  const removeEmptyListItems = (list) => {
    if (list.length === 1 && list[0].text.trim() === '') {
      return list;
    }
    return list.filter(item => item.text.trim() !== '');
  };

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const reordered = Array.from(note.listItems);
    const [movedItem] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, movedItem);

    setNote(prevNote => ({
      ...prevNote,
      listItems: reordered
    }));
  };

  const handleDrawingSave = (dataUrl) => {
    setNote(prev => ({ ...prev, drawingDataUrl: dataUrl }));
  };

  const handleImageUpload = async (file, url, base64) => {
    if (base64) {
      setNote(prev => ({ ...prev, imageUrl: base64, imageData: base64 }));
    } else if (url) {
      setNote(prev => ({ ...prev, imageUrl: url, imageData: null }));
    }
  };

  const handleColorChange = (color) => {
    setNote(prev => ({ ...prev, color }));
  };

  const toggleFormatting = (type) => {
    setFormatting(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const toggleMoreOptions = () => {
    setMoreOptionsOpen(!moreOptionsOpen);
  };

  const submitNote = (e) => {
    e.preventDefault();

    let finalNote = { ...note };

    if (finalNote.type === 'list') {
      finalNote.listItems = removeEmptyListItems(finalNote.listItems);
    }

    if (finalNote.type === 'note') {
      if (finalNote.title.trim() === '' && finalNote.content.trim() === '') {
        alert('Title or content required for text notes.');
        return;
      }
    } else if (finalNote.type === 'list') {
      if (finalNote.listItems.length === 0 || finalNote.listItems.every(item => item.text.trim() === '')) {
        alert('At least one list item is required for list notes.');
        return;
      }
    } else if (finalNote.type === 'image') {
      if (!finalNote.imageUrl) {
        alert('An image is required for image notes.');
        return;
      }
    } else if (finalNote.type === 'drawing') {
      if (!finalNote.drawingDataUrl) {
        alert('A drawing is required for drawing notes.');
        return;
      }
    }

    // Ensure currentLabel is included in labels
    let labelsToSend = selectedLabels.length > 0 ? selectedLabels.map(label => label.id || label) : [];
    if (currentLabel && !labelsToSend.includes(currentLabel.id)) {
      labelsToSend.push(currentLabel.id);
    }

    const noteToSend = {
      title: finalNote.title,
      content: finalNote.content,
      type: finalNote.type,
      color: finalNote.color,
      pinned: finalNote.pinned,
      createdAt: new Date().toISOString(),
      labels: labelsToSend.length > 0 ? labelsToSend : [],
      category: currentLabel || null,
    };

    if (finalNote.type === 'list') {
      noteToSend.content = finalNote.listItems.map(item => (item.checked ? '[x] ' : '[ ] ') + item.text).join('\n');
      noteToSend.listItems = finalNote.listItems;
    } else if (finalNote.type === 'drawing') {
      noteToSend.drawingData = finalNote.drawingDataUrl;
    } else if (finalNote.type === 'image') {
      noteToSend.imageData = finalNote.imageData || note.imageUrl;
    }

    onAdd(noteToSend);

    setNote({
      title: '',
      content: '',
      color: darkMode ? '#1e293b' : '#ffffff',
      pinned: false,
      type: 'note',
      listItems: [],
      drawingDataUrl: null,
      imageData: null,
      imageUrl: null,
      drawingColor: '#000000',
    });
    setSelectedLabels([]);
    setIsExpanded(false);
    setMoreOptionsOpen(false);
    setFormatting({ bold: false, italic: false, underline: false });
  };

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

  const isNoteValid = 
    (note.type === 'note' && (note.title || note.content)) ||
    (note.type === 'list' && note.listItems.some(item => item.text.trim() !== '')) ||
    (note.type === 'image' && note.imageUrl) ||
    (note.type === 'drawing' && note.drawingDataUrl);

  return (
    <div className="my-8 max-w-2xl mx-auto transition-all duration-300">
      {!isExpanded && (
        <div className={`flex justify-between items-center p-3 rounded-xl shadow-md mb-3 transition-all
          ${darkMode ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-700'}`}>
          <button
            onClick={() => handleNoteTypeChange('note')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all hover:scale-[1.03] ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            aria-label="Create a new text note"
          >
            <Type className="mr-2 h-5 w-5" />
            <span>New Note</span>
          </button>

          {editLabelsModalOpen && (
            <EditLabelsModal
              isOpen={editLabelsModalOpen}
              onClose={() => setEditLabelsModalOpen(false)}
              labels={allLabels}
              setLabels={setAllLabels}
              onLabelsChange={onLabelsChange}
              darkMode={darkMode}
            />
          )}

          <button
            onClick={() => handleNoteTypeChange('list')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all hover:scale-[1.03] ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            aria-label="Create a new list note"
          >
            <List className="mr-2 h-5 w-5" />
            <span>New List</span>
          </button>

          <button
            onClick={() => handleNoteTypeChange('drawing')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all hover:scale-[1.03] ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            aria-label="Create a new drawing note"
          >
            <PenTool className="mr-2 h-5 w-5" />
            <span>Drawing</span>
          </button>

          <button
            onClick={() => handleNoteTypeChange('image')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all hover:scale-[1.03] ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            aria-label="Create a new image note"
          >
            <Camera className="mr-2 h-5 w-5" />
            <span>Image</span>
          </button>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={submitNote}
        className={`
          p-4 rounded-2xl shadow-xl transition-all duration-300 ease-in-out overflow-hidden
          ${darkMode ? 'border border-gray-700 text-gray-100' : 'border border-gray-200 text-gray-800'}
          ${isExpanded ? 'scale-100' : 'scale-95 hover:scale-100'}
        `}
        style={{
          backgroundColor: note.color,
          boxShadow: isExpanded ?
            (darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)') : 'none'
        }}
      >
        {isExpanded && (
          <>
            <div className="flex justify-between items-center mb-3">
              <input
                name="title"
                onChange={handleChange}
                value={note.title}
                placeholder="Title"
                className={`
                  flex-grow p-2 text-xl font-semibold focus:outline-none rounded-lg bg-transparent
                  ${formatting.bold ? 'font-bold' : ''}
                  ${formatting.italic ? 'italic' : ''}
                  ${formatting.underline ? 'underline' : ''}
                  ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}
                `}
              />
              <button
                type="button"
                onClick={togglePin}
                className={`
                  ml-3 p-2 rounded-full transition-all transform hover:scale-110
                  ${note.pinned ? 'text-amber-500' : 'text-gray-400'}
                `}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              >
                <Pin className="h-5 w-5" fill={note.pinned ? 'currentColor' : 'none'} />
              </button>
            </div>

            {(note.type === 'note' || note.type === 'drawing' || note.type === 'image') && (
              <textarea
                name="content"
                onChange={handleChange}
                value={note.content}
                placeholder="Add your notes here..."
                rows={note.type === 'drawing' || note.type === 'image' ? 2 : 4}
                className={`
                  w-full p-3 mb-3 focus:outline-none rounded-lg transition-all bg-transparent
                  ${formatting.bold ? 'font-bold' : ''}
                  ${formatting.italic ? 'italic' : ''}
                  ${formatting.underline ? 'underline' : ''}
                  ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}
                `}
              />
            )}

            {note.type === 'list' && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="listItems">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 py-2">
                      {note.listItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-start bg-opacity-20 rounded-lg p-1.5 transition
                                ${snapshot.isDragging ? (darkMode ? 'bg-gray-700' : 'bg-blue-100') : ''}`}
                            >
                              <div className="flex items-center flex-grow">
                                <button
                                  onClick={() => toggleCheckItem(item.id)}
                                  className={`
                                    mt-1.5 mr-2 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors
                                    ${item.checked ? 'bg-green-500 border-green-500' : darkMode ? 'border-gray-400' : 'border-gray-400'}
                                  `}
                                  aria-label={item.checked ? 'Uncheck item' : 'Check item'}
                                  type="button"
                                >
                                  {item.checked && <CheckCircle size={16} className="text-white" strokeWidth={2.5} />}
                                </button>
                                <input
                                  type="text"
                                  value={item.text}
                                  onChange={(e) => updateListItem(item.id, e.target.value)}
                                  placeholder="List item"
                                  className={`
                                    flex-grow p-2 focus:outline-none rounded-lg bg-transparent
                                    ${item.checked ? 'line-through text-gray-500' : ''}
                                    ${darkMode ? 'text-white' : 'text-gray-800'}
                                  `}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeListItem(item.id)}
                                className="p-2 ml-2 text-gray-500 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      <button
                        type="button"
                        onClick={addListItem}
                        className={`
                          mt-2 px-4 py-2.5 rounded-lg flex items-center justify-center w-full transition-all
                          ${darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-200/50'}
                        `}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        <span>Add item</span>
                      </button>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {note.type === 'drawing' && (
              <div className="mb-4">
                <DrawingCanvas 
                  onSave={handleDrawingSave} 
                  darkMode={darkMode} 
                  initialDrawingData={note.drawingDataUrl} 
                  drawingColor={note.drawingColor} 
                />
                <div className="mt-4">
                  <label htmlFor="drawingColor" className="text-sm font-semibold block mb-1">
                    Drawing Color:
                  </label>
                  <input
                    id="drawingColor"
                    type="color"
                    value={note.drawingColor}
                    onChange={(e) => setNote(prev => ({ ...prev, drawingColor: e.target.value }))}
                    className="w-12 h-8 p-0 border-0 cursor-pointer"
                    title="Select drawing color"
                  />
                </div>
              </div>
            )}

            {note.type === 'image' && (
              <div className="mb-4">
                <ImageUpload 
                  onUpload={handleImageUpload} 
                  darkMode={darkMode} 
                  initialImage={note.imageUrl}
                />
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="mt-4">
                <EditLabelsModal
                  isOpen={editLabelsModalOpen}
                  onClose={() => setEditLabelsModalOpen(false)}
                  labels={allLabels}
                  setLabels={setAllLabels}
                  onLabelsChange={setAllLabels}
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200/30">
              <div className="flex space-x-1">
                {note.type === 'note' && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleFormatting('bold')}
                      className={`
                        p-2 rounded-lg transition-colors transform hover:scale-110
                        ${formatting.bold ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500'}
                        ${darkMode && !formatting.bold ? 'hover:bg-gray-700/50' : ''}
                      `}
                      aria-label="Bold"
                    >
                      <Bold className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFormatting('italic')}
                      className={`
                        p-2 rounded-lg transition-colors transform hover:scale-110
                        ${formatting.italic ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500'}
                        ${darkMode && !formatting.italic ? 'hover:bg-gray-700/50' : ''}
                      `}
                      aria-label="Italic"
                    >
                      <Italic className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFormatting('underline')}
                      className={`
                        p-2 rounded-lg transition-colors transform hover:scale-110
                        ${formatting.underline ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500'}
                        ${darkMode && !formatting.underline ? 'hover:bg-gray-700/50' : ''}
                      `}
                      aria-label="Underline"
                    >
                      <Underline className="h-5 w-5" />
                    </button>
                  </>
                )}

                <div className="relative" ref={moreOptionsRef}>
                  <button
                    type="button"
                    onClick={toggleMoreOptions}
                    className={`
                      p-2 rounded-lg flex items-center transition-colors transform hover:scale-110
                      ${moreOptionsOpen ? 'bg-blue-500/10 text-blue-500' : 'text-gray-500'}
                      ${darkMode && !moreOptionsOpen ? 'hover:bg-gray-700/50' : ''}
                    `}
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <ChevronDown className={`h-4 w-4 ml-0.5 transition-transform ${moreOptionsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {moreOptionsOpen && (
                    <div className={`
                      absolute bottom-full mb-2 left-0 w-56 rounded-xl shadow-lg z-50 overflow-hidden
                      ${darkMode ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-700'}
                      transition-all duration-200 origin-bottom-left
                    `}>
                    <button
                      type="button"
                      className={`
                        w-full text-left px-4 py-3 flex items-center transition-colors
                        ${darkMode ? 'hover:bg-gray-700/80' : 'hover:bg-gray-100'}
                      `}
                      onClick={() => {
                        setEditLabelsModalOpen(true);
                      }}
                    >
                      <Tag className="mr-3 h-5 w-5 text-gray-500" />
                      <span>Add label</span>
                    </button>
                    <button
                      type="button"
                      className={`
                        w-full text-left px-4 py-3 flex items-center transition-colors
                        ${darkMode ? 'hover:bg-gray-700/80' : 'hover:bg-gray-100'}
                      `}
                    >
                      <Clock className="mr-3 h-5 w-5 text-gray-500" />
                      <span>Reminder</span>
                    </button>
                    <button
                      type="button"
                      className={`
                        w-full text-left px-4 py-3 flex items-center transition-colors
                        ${darkMode ? 'hover:bg-gray-700/80' : 'hover:bg-gray-100'}
                      `}
                    >
                      <User className="mr-3 h-5 w-5 text-gray-500" />
                      <span>Collaborator</span>
                    </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setNote({
                      title: '',
                      content: '',
                      color: darkMode ? '#1e293b' : '#ffffff',
                      pinned: false,
                      type: 'note',
                      listItems: [],
                      drawingDataUrl: null,
                      imageData: null,
                      imageUrl: null,
                      drawingColor: '#000000',
                    });
                    setIsExpanded(false);
                    setMoreOptionsOpen(false);
                    setFormatting({ bold: false, italic: false, underline: false });
                  }}
                  className={`
                    p-2 rounded-lg transition-colors text-gray-500 transform hover:scale-110
                    ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'}
                  `}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={!isNoteValid}
                  className={`
                    px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-[1.03]
                    ${
                      isNoteValid
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md'
                        : (darkMode 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                    }
                  `}
                  aria-label="Add note"
                >
                  <Send className="h-5 w-5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </>
        )}

        {!isExpanded && (
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex items-center cursor-pointer"
          >
            <input
              placeholder={`Take a ${note.type} note...`}
              className={`
                w-full py-3 px-2 focus:outline-none bg-transparent
                ${darkMode ? 'text-gray-300 placeholder-gray-400' : 'text-gray-600 placeholder-gray-500'}
              `}
              readOnly
            />
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin();
                }}
                className={`
                  p-2 rounded-full transition-all
                  ${note.pinned ? 'text-amber-500' : 'text-gray-400'}
                `}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              >
                <Pin className="h-5 w-5" fill={note.pinned ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
