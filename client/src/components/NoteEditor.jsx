import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';
import ReminderPicker from './ReminderPicker';
import ImageUpload from './ImageUpload';
import DrawingCanvas from './DrawingCanvas';

/*****************************************************************
 * Constants & helpers
 *****************************************************************/
const BLOCK_TYPES = {
  TEXT: 'text',
  CHECKLIST: 'checklist',
  IMAGE: 'image',
  DRAWING: 'drawing',
};

const generateId = () => '_' + Math.random().toString(36).slice(2, 9);

const createEmptyBlock = (type) => {
  switch (type) {
    case BLOCK_TYPES.TEXT:
      return { id: generateId(), type: BLOCK_TYPES.TEXT, data: '' };
    case BLOCK_TYPES.CHECKLIST:
      return { id: generateId(), type: BLOCK_TYPES.CHECKLIST, data: [] };
    case BLOCK_TYPES.IMAGE:
      return { id: generateId(), type: BLOCK_TYPES.IMAGE, data: null };
    case BLOCK_TYPES.DRAWING:
      return { id: generateId(), type: BLOCK_TYPES.DRAWING, data: null };
    default:
      return createEmptyBlock(BLOCK_TYPES.TEXT);
  }
};

/*****************************************************************
 * Root component
 *****************************************************************/
export default function NoteEditor({
  initialNote,
  onSave,
  onCancel,
  onDelete,
  darkMode,
  isModal = false,
}) {
  /* ---------- state ---------- */
  const [note, setNote] = useState(() => {
    const fallback = {
      id: null,
      title: '',
      blocks: [createEmptyBlock(BLOCK_TYPES.TEXT)],
      color: darkMode ? '#202124' : '#ffffff',
      labels: [],
      reminder: null,
      collaborators: [],
      status: 'active',
      pinned: false,
      lastModified: new Date(),
      contentChanged: false,
    };
    if (!initialNote) return fallback;
    return { ...fallback, ...initialNote };
  });

  useEffect(() => {
    if (initialNote) {
      console.log('NoteEditor useEffect initialNote:', initialNote);
      setNote((prevNote) => {
        // Only update if the id is different to avoid unnecessary updates
        if (!prevNote.id || prevNote.id !== initialNote.id) {
          const fallback = {
            id: null,
            title: '',
            blocks: [createEmptyBlock(BLOCK_TYPES.TEXT)],
            color: darkMode ? '#202124' : '#ffffff',
            labels: [],
            reminder: null,
            collaborators: [],
            status: 'active',
            pinned: false,
            lastModified: new Date(),
            contentChanged: false,
          };
          // If initialNote.blocks is missing or empty, create blocks from initialNote.content
          let blocks = initialNote.blocks;
          if (!blocks || blocks.length === 0) {
            blocks = [createEmptyBlock(BLOCK_TYPES.TEXT)];
            if (initialNote.content) {
              blocks[0].data = initialNote.content;
            }
          }
          const newNote = { ...fallback, ...initialNote, blocks };
          console.log('NoteEditor setting new note:', newNote);
          return newNote;
        }
        return prevNote;
      });
    }
  }, [initialNote, darkMode]);

  console.log('NoteEditor rendering note:', note);
  console.log('NoteEditor blocks:', note.blocks);

  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [editLabelsModalOpen, setEditLabelsModalOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState(note.labels || []);

  useEffect(() => {
    if (initialNote && initialNote.labels) {
      setSelectedLabels(initialNote.labels);
    }
  }, [initialNote]);
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    header: null,
  });

  /* ---------- autosave ---------- */
  const debouncedSave = useDebouncedCallback(() => {
    if (note.contentChanged) {
      onSave?.({ ...note, contentChanged: false, lastModified: new Date(), labels: selectedLabels });
      setNote((n) => ({ ...n, contentChanged: false }));
    }
  }, 1200);

  useEffect(() => {
    debouncedSave();
  }, [note, debouncedSave, selectedLabels]);

  /* ---------- updaters ---------- */
  const update = (updater) =>
    setNote((n) => ({ ...updater(n), contentChanged: true }));

  const updateTitle = (title) => update((n) => ({ ...n, title }));
  const updateBlock = (blockId, data) =>
    update((n) => ({
      ...n,
      blocks: n.blocks.map((b) => (b.id === blockId ? { ...b, data } : b)),
    }));
  const addBlock = (type, index) =>
    update((n) => ({
      ...n,
      blocks: [
        ...n.blocks.slice(0, index + 1),
        createEmptyBlock(type),
        ...n.blocks.slice(index + 1),
      ],
    }));
  const removeBlock = (blockId) =>
    update((n) => ({ ...n, blocks: n.blocks.filter((b) => b.id !== blockId) }));
  const splitBlock = (index, textAfter) =>
    update((n) => {
      const newBlocks = [...n.blocks];
      newBlocks.splice(index + 1, 0, createEmptyBlock(BLOCK_TYPES.TEXT));
      newBlocks[index].data = newBlocks[index].data.slice(
        0,
        newBlocks[index].data.length - textAfter.length
      );
      newBlocks[index + 1].data = textAfter;
      return { ...n, blocks: newBlocks };
    });

  /* ---------- handlers for new features ---------- */
  const handleSetReminder = (date) => {
    setNote(prev => ({ ...prev, reminder: date }));
    setShowReminderPicker(false);
  };

  const removeReminder = () => {
    setNote(prev => ({ ...prev, reminder: null }));
  };

  const handleLabelsChange = (labels) => {
    setSelectedLabels(labels);
  };

  const toggleFormatting = (type) => {
    setFormatting(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const applyHeaderFormat = (level) => {
    setFormatting(prev => ({
      ...prev,
      header: level,
    }));
  };

  const clearFormatting = () => {
    setFormatting({
      bold: false,
      italic: false,
      underline: false,
      header: null,
    });
  };

  /* ---------- render ---------- */
  return (
    <div
      className={clsx(
        'note-editor group relative flex flex-col space-y-3 max-w-2xl mx-auto',
        isModal ? '' : 'p-4 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto',
        isModal ? '' : darkMode ? 'bg-[#202124] text-[#bdc1c6]' : 'bg-white text-[#202124]'
      )}
      style={isModal ? {} : { backgroundColor: note.color }}
    >
      {/* Title and Pin */}
      <div className="flex justify-between items-center mb-2">
        <TitleField value={note.title} onChange={updateTitle} darkMode={darkMode} />
        <button
          onClick={() => setNote((n) => ({ ...n, pinned: !n.pinned }))}
          className={clsx(
            'ml-2 p-2 rounded-full transition-all transform hover:scale-110',
            note.pinned ? 'text-yellow-500' : 'text-gray-500'
          )}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          title={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          📌
        </button>
      </div>

      {/* Blocks */}
      <div className="blocks space-y-2">
        {note.blocks.map((block, idx) => (
          <React.Fragment key={block.id}>
            <Block
              block={block}
              onUpdate={(data) => updateBlock(block.id, data)}
              onRemove={() => removeBlock(block.id)}
              onSplit={(textAfter) => splitBlock(idx, textAfter)}
              darkMode={darkMode}
              formatting={formatting}
              toggleFormatting={toggleFormatting}
              applyHeaderFormat={applyHeaderFormat}
              clearFormatting={clearFormatting}
            />
            <AddBetween index={idx} onAdd={(type) => addBlock(type, idx)} />
          </React.Fragment>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mt-3 text-gray-400 dark:text-gray-300 border-t border-gray-600 pt-2 space-x-4">
        <button
          type="button"
          aria-label="Text formatting"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          onClick={() => toggleFormatting('bold')}
          title="Bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h6a4 4 0 010 8H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h7a4 4 0 010 8H6z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Text color"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          title="Text color"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Set reminder"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          onClick={() => setShowReminderPicker(true)}
          title="Set reminder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Add collaborators"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          title="Add collaborators"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20H4v-2a4 4 0 013-3.87" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Add image"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          onClick={() => addBlock(BLOCK_TYPES.IMAGE, note.blocks.length - 1)}
          title="Add image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l7 7 4-4 5 5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Archive note"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          title="Archive note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 10v10a2 2 0 002 2h10a2 2 0 002-2V10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10V6a3 3 0 016 0v4" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="More options"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          title="More options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v.01M12 12v.01M12 18v.01" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Undo"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h11a4 4 0 010 8H6l-3-3" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Redo"
          className="hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 14H10a4 4 0 000 8h7l3-3" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Close"
          className="ml-auto hover:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition"
          onClick={() => onCancel?.()}
          title="Close"
        >
          Close
        </button>
      </div>

      {/* Reminder Picker */}
      {showReminderPicker && (
        <div className={`absolute top-full left-0 mt-2 flex items-start justify-start z-50`}>
          <div className={`w-64 rounded-md shadow-lg p-4
            ${darkMode ? 'bg-gray-900 text-gray-100 ring-1 ring-white ring-opacity-20' : 'bg-gray-50 text-gray-900 ring-1 ring-black ring-opacity-5'}`}
            style={{ zIndex: 1000 }}
          >
            <h3 className="font-medium mb-2">Set reminder</h3>
            <ReminderPicker
              reminder={note.reminder}
              setReminder={handleSetReminder}
              onClose={() => setShowReminderPicker(false)}
            />
          </div>
        </div>
      )}

      {/* Labels Modal */}
      {editLabelsModalOpen && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditLabelsModalOpen(false)}>
          <div className={`rounded-lg p-6 max-w-md w-full ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Labels</h3>
              <button 
                onClick={() => setEditLabelsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {selectedLabels.map(label => (
                <div 
                  key={label.id} 
                  className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => {
                    setSelectedLabels(prev => 
                      prev.includes(label) 
                        ? prev.filter(l => l.id !== label.id) 
                        : [...prev, label]
                    );
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedLabels.some(l => l.id === label.id)}
                    className="mr-2"
                    readOnly
                  />
                  <span>{label.name}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <button 
                onClick={() => setEditLabelsModalOpen(false)}
                className="px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleLabelsChange(selectedLabels);
                  setEditLabelsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Action bar (hover only) */}
      <ActionBar
        note={note}
        setNote={setNote}
        onDelete={onDelete}
        onCancel={onCancel}
        darkMode={darkMode}
        setShowReminderPicker={setShowReminderPicker}
        setEditLabelsModalOpen={setEditLabelsModalOpen}
      />
    </div>
  );
}

/*****************************************************************
 * Title field
 *****************************************************************/
function TitleField({ value, onChange, darkMode }) {
  const ref = useRef();
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.textContent)}
      data-placeholder="Title"
      className={clsx(
        'text-2xl font-bold outline-none',
        darkMode ? 'text-white' : 'text-gray-900',
        !value && 'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500'
      )}
    />
  );
}

/*****************************************************************
 * Block dispatcher
 *****************************************************************/
function Block({ block, onUpdate, onRemove, onSplit, darkMode }) {
  switch (block.type) {
    case BLOCK_TYPES.TEXT:
      return <TextBlock data={block.data} onUpdate={onUpdate} onSplit={onSplit} darkMode={darkMode} />;
    case BLOCK_TYPES.CHECKLIST:
      return <ChecklistBlock data={block.data} onUpdate={onUpdate} darkMode={darkMode} />;
    case BLOCK_TYPES.IMAGE:
      return <ImageBlock data={block.data} onUpdate={onUpdate} onRemove={onRemove} />;
    case BLOCK_TYPES.DRAWING:
      return <DrawingBlock data={block.data} onUpdate={onUpdate} onRemove={onRemove} />;
    default:
      return null;
  }
}

/*****************************************************************
 * Text block
 *****************************************************************/
function TextBlock({ data, onUpdate, onSplit, darkMode }) {
  const ref = useRef();

  React.useEffect(() => {
    if (ref.current && ref.current.textContent !== data) {
      ref.current.textContent = data;
    }
  }, [data]);

  const handleInput = (e) => onUpdate(e.currentTarget.textContent);
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      const after = range.cloneContents().textContent;
      const before = ref.current.textContent.slice(0, range.startOffset);
      onUpdate(before);
      onSplit(after);
    }
  };
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKey}
      data-placeholder="Take a note…"
      className={clsx(
        'p-2 rounded outline-none min-h-[1.5em]',
        darkMode ? 'text-gray-100' : 'text-gray-900',
        !data && 'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500'
      )}
    >
      {data}
    </div>
  );
}

/*****************************************************************
 * Checklist block
 *****************************************************************/
function ChecklistBlock({ data, onUpdate }) {
  const toggle = (i) =>
    onUpdate(data.map((it, idx) => (idx === i ? { ...it, checked: !it.checked } : it)));
  const changeText = (i, text) =>
    onUpdate(data.map((it, idx) => (idx === i ? { ...it, text } : it)));
  const add = () => onUpdate([...data, { id: generateId(), text: '', checked: false }]);
  const remove = (i) => onUpdate(data.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1">
      {data.map((it, idx) => (
        <label key={it.id} className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" checked={it.checked} onChange={() => toggle(idx)} />
          <input
            type="text"
            value={it.text}
            onChange={(e) => changeText(idx, e.target.value)}
            placeholder="List item"
            className="flex-grow bg-transparent border-none outline-none"
          />
          <button onClick={() => remove(idx)} className="text-red-500 text-sm">
            ×
          </button>
        </label>
      ))}
      <button onClick={add} className="text-sm text-blue-500">
        + Add item
      </button>
    </div>
  );
}

/*****************************************************************
 * Image block
 *****************************************************************/
function ImageBlock({ data, onUpdate, onRemove }) {
  const inputRef = useRef();
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpdate({ file, url });
  };
  return (
    <div className="relative group">
      {data?.url ? (
        <>
          <img src={data.url} alt="" className="rounded-md w-full max-h-60 object-cover" />
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition"
          >
            ×
          </button>
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400"
        >
          + Add image
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}

/*****************************************************************
 * Drawing block
 *****************************************************************/
function DrawingBlock({ data, onUpdate }) {
  const canvasRef = useRef();
  const [ctx, setCtx] = useState(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const context = c.getContext('2d');
    setCtx(context);
    if (data?.image) {
      const img = new Image();
      img.onload = () => context.drawImage(img, 0, 0);
      img.src = data.image;
    }
  }, [data]);

  const start = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };
  const draw = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };
  const stop = () => {
    if (!drawing) return;
    setDrawing(false);
    onUpdate({ image: canvasRef.current.toDataURL() });
  };
  const clear = () => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onUpdate({ image: null });
  };

  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        width="100%"
        height="200"
        className="border rounded-md w-full touch-none"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
      />
      <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={clear} className="bg-black/50 text-white rounded px-2 text-xs">
          Clear
        </button>
      </div>
    </div>
  );
}

/*****************************************************************
 * Hover “+” between blocks
 *****************************************************************/
function AddBetween({ index, onAdd }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative h-2 flex justify-center items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {show && (
        <button
          onClick={() => onAdd(BLOCK_TYPES.TEXT)}
          className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs"
        >
          +
        </button>
      )}
    </div>
  );
}

/*****************************************************************
 * Action bar (hover only)
 *****************************************************************/
function ActionBar({ note, setNote, onDelete, onCancel, darkMode }) {
  return (
    <div
      className={clsx(
        'action-bar fixed bottom-4 right-4 flex space-x-2 bg-transparent p-2 rounded-md shadow-lg z-50',
        darkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-white bg-opacity-90'
      )}
    >
      <button
        onClick={() => setNote((n) => ({ ...n, pinned: !n.pinned }))}
        className="p-2 rounded bg-black/10 hover:bg-black/20"
        title="Pin"
      >
        {note.pinned ? '📌' : '📍'}
      </button>
      <button
        onClick={() => setNote((n) => ({ ...n, color: '#ffeb3b' }))}
        className="p-2 rounded bg-yellow-400"
        title="Color"
      >
        🎨
      </button>
      <button
        onClick={() => onDelete?.(note.id)}
        className="p-2 rounded bg-red-500 text-white"
        title="Delete"
      >
        🗑
      </button>
    </div>
  );
}
