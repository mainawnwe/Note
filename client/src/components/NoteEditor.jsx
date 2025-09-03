import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';
import ReminderPicker from './ReminderPicker';
import DrawingCanvas from './DrawingCanvas';
import {
  Pin, Bell, UserPlus, ImageIcon, Archive, Trash2, MoreVertical,
  Undo, Redo, Bold, Italic, Underline, X, CheckSquare, Type, Edit3, Plus, Palette, Tag,
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Save
} from 'lucide-react';

// -------------------
// CONSTANTS & HELPERS
// -------------------
const BLOCK_TYPES = {
  TEXT: 'text',
  CHECKLIST: 'checklist',
  IMAGE: 'image',
  DRAWING: 'drawing',
};

const generateId = () => '_' + Math.random().toString(36).slice(2, 9);

// Helper functions
const normalizeLabels = (labels) => {
  if (!Array.isArray(labels)) return [];
  return labels.map(label =>
    typeof label === 'string' ? label : String(label.id ?? label.name ?? label)
  );
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const bakeImageWithBg = async (imageData, bgColor) => {
  if (!imageData) return '';
  return imageData;
};

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';
const LABELS_ENDPOINT = process.env.REACT_APP_LABELS_ENDPOINT || 'http://localhost:8000/labels.php';

const createEmptyBlock = (type) => {
  switch (type) {
    case BLOCK_TYPES.TEXT:
      return {
        id: generateId(),
        type: BLOCK_TYPES.TEXT,
        data: '',
        formatting: { bold: false, italic: false, underline: false }
      };
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

const createBlocksFromInitial = (initial, noteType) => {
  const blocks = [];
  
  if (initial && Array.isArray(initial.blocks) && initial.blocks.length > 0) {
    blocks.push(...initial.blocks.map(b => {
      const id = b.id || generateId();
      const type = b.type;
      
      if (type === BLOCK_TYPES.TEXT) {
        return {
          id,
          type: BLOCK_TYPES.TEXT,
          data: typeof b.data === 'string' ? b.data : '',
          formatting: {
            bold: !!b?.formatting?.bold,
            italic: !!b?.formatting?.italic,
            underline: !!b?.formatting?.underline,
          },
        };
      }
      
      if (type === BLOCK_TYPES.CHECKLIST) {
        const data = Array.isArray(b.data) ? b.data : [];
        return { id, type: BLOCK_TYPES.CHECKLIST, data };
      }
      
      if (type === BLOCK_TYPES.IMAGE) {
        return { id, type: BLOCK_TYPES.IMAGE, data: b.data || null };
      }
      
      if (type === BLOCK_TYPES.DRAWING) {
        return { id, type: BLOCK_TYPES.DRAWING, data: b.data || null };
      }
      
      return createEmptyBlock(BLOCK_TYPES.TEXT);
    }));
  }
  
  if (initial) {
    const content = initial.content;
    const contentHtml = initial.content_html;
    
    if (contentHtml) {
      try {
        const container = typeof document !== 'undefined' ? document.createElement('div') : null;
        if (container) {
          container.innerHTML = contentHtml;
          const paragraphs = container.querySelectorAll('p');
          const nodes = paragraphs.length ? Array.from(paragraphs) : [container];
          
          nodes.forEach(el => {
            const text = el.textContent || '';
            const hasBold = !!el.querySelector('b,strong');
            const hasItalic = !!el.querySelector('i,em');
            const hasUnderline = !!el.querySelector('u');
            
            if (text.trim()) {
              blocks.push({
                id: generateId(),
                type: BLOCK_TYPES.TEXT,
                data: text,
                formatting: { bold: hasBold, italic: hasItalic, underline: hasUnderline }
              });
            }
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    if (!blocks.length && content) {
      let adjusted = content;
      
      try {
        if ((initial?.type === 'list' || noteType === 'list') && Array.isArray(initial?.listItems) && initial.listItems.length > 0) {
          const itemTexts = initial.listItems.map(it => String(it?.text ?? '').trim()).filter(Boolean);
          const lines = String(content).split(/\r?\n/).map(l => l.trim());
          const filtered = lines.filter(l => l && !itemTexts.includes(l));
          adjusted = filtered.join('\n').trim();
        }
      } catch {}
      
      if (adjusted && adjusted.trim() !== '') {
        blocks.push({ id: generateId(), type: BLOCK_TYPES.TEXT, data: adjusted });
      }
    }
    
    const listItems = initial.listItems;
    if (Array.isArray(listItems) && listItems.length > 0) {
      blocks.push({ id: generateId(), type: BLOCK_TYPES.CHECKLIST, data: listItems });
    }
    
    let drawingData = initial.drawing_data;
    if (Array.isArray(drawingData)) {
      drawingData = drawingData.filter(u => typeof u === 'string' && u.trim());
    } else if (typeof drawingData === 'string') {
      try {
        drawingData = JSON.parse(drawingData);
      } catch {}
    }
    
    if (Array.isArray(drawingData)) {
      drawingData
        .filter(u => typeof u === 'string' && u.trim())
        .forEach(u => {
          blocks.push({ id: generateId(), type: BLOCK_TYPES.DRAWING, data: { image: u } });
        });
    } else if (typeof drawingData === 'string' && drawingData.trim()) {
      blocks.push({ id: generateId(), type: BLOCK_TYPES.DRAWING, data: { image: drawingData } });
    }
    
    let imageData = initial.image_url;
    if (Array.isArray(imageData)) {
      imageData = imageData.filter(u => typeof u === 'string' && u.trim());
    } else if (typeof imageData === 'string') {
      try {
        imageData = JSON.parse(imageData);
      } catch {}
    }
    
    if (Array.isArray(imageData)) {
      imageData
        .filter(u => typeof u === 'string' && u.trim())
        .forEach(u => {
          blocks.push({ id: generateId(), type: BLOCK_TYPES.IMAGE, data: { url: u } });
        });
    } else if (typeof imageData === 'string' && imageData.trim()) {
      blocks.push({ id: generateId(), type: BLOCK_TYPES.IMAGE, data: { url: imageData } });
    }
  }
  
  if (blocks.length === 0) {
    blocks.push(createEmptyBlock(noteType || BLOCK_TYPES.TEXT));
  }
  
  return blocks;
};

// -------------------
// MAIN COMPONENTS
// -------------------
const NoteEditor = ({
  initialNote,
  onSave,
  onCancel,
  onDelete,
  darkMode = false,
  isModal = false,
  onLabelsChange,
  currentLabel,
  allLabels,
  setAllLabels,
  onColorChange,
  initialColor,
  noteType
}) => {
  const [note, setNote] = useState(() => {
    const fallback = {
      id: null,
      title: '',
      blocks: ((noteType === 'image' || noteType === 'drawing')
        ? [createEmptyBlock(noteType === 'image' ? BLOCK_TYPES.IMAGE : BLOCK_TYPES.DRAWING), createEmptyBlock(BLOCK_TYPES.TEXT)]
        : (noteType === 'list'
          ? [{ id: generateId(), type: BLOCK_TYPES.CHECKLIST, data: [{ id: generateId(), text: '', checked: false }] }, createEmptyBlock(BLOCK_TYPES.TEXT)]
          : [createEmptyBlock(noteType || BLOCK_TYPES.TEXT)]
        )),
      type: noteType === 'text' ? 'note' : (noteType || 'note'),
      color: initialColor ?? (darkMode ? '#202124' : '#ffffff'),
      labels: [],
      reminder: null,
      collaborators: [],
      status: 'active',
      pinned: false,
      lastModified: new Date(),
      contentChanged: false,
    };
    
    if (!initialNote) return fallback;
    
    return {
      ...fallback,
      ...initialNote,
      blocks: createBlocksFromInitial(initialNote, noteType)
    };
  });
  
  useEffect(() => {
    if (initialNote && initialNote.id) {
      setNote(prevNote => {
        if (prevNote.id !== initialNote.id) {
          const fallback = {
            id: null,
            title: '',
            blocks: ((noteType === 'image' || noteType === 'drawing')
              ? [createEmptyBlock(noteType === 'image' ? BLOCK_TYPES.IMAGE : BLOCK_TYPES.DRAWING), createEmptyBlock(BLOCK_TYPES.TEXT)]
              : (noteType === 'list'
                ? [{ id: generateId(), type: BLOCK_TYPES.CHECKLIST, data: [{ id: generateId(), text: '', checked: false }] }, createEmptyBlock(BLOCK_TYPES.TEXT)]
                : [createEmptyBlock(noteType || BLOCK_TYPES.TEXT)]
              )),
            type: noteType === 'text' ? 'note' : (noteType || 'note'),
            color: initialColor ?? (darkMode ? '#202124' : '#ffffff'),
            labels: [],
            reminder: null,
            collaborators: [],
            status: 'active',
            pinned: false,
            lastModified: new Date(),
            contentChanged: false,
          };
          return { ...fallback, ...initialNote, blocks: createBlocksFromInitial(initialNote, noteType) };
        }
        return prevNote;
      });
    }
  }, [initialNote]);
  
  useEffect(() => {
    if (!initialNote || initialNote.id) return;
    
    const blockType = noteType === 'list' ? BLOCK_TYPES.CHECKLIST :
      noteType === 'drawing' ? BLOCK_TYPES.DRAWING :
      noteType === 'image' ? BLOCK_TYPES.IMAGE : BLOCK_TYPES.TEXT;
    
    let newBlocks;
    if (blockType === BLOCK_TYPES.IMAGE || blockType === BLOCK_TYPES.DRAWING) {
      newBlocks = [createEmptyBlock(blockType), createEmptyBlock(BLOCK_TYPES.TEXT)];
    } else if (blockType === BLOCK_TYPES.CHECKLIST) {
      newBlocks = [
        { id: generateId(), type: BLOCK_TYPES.CHECKLIST, data: [{ id: generateId(), text: '', checked: false }] },
        createEmptyBlock(BLOCK_TYPES.TEXT)
      ];
    } else {
      newBlocks = [createEmptyBlock(blockType)];
    }
    
    setNote(prev => ({
      ...prev,
      type: noteType === 'text' ? 'note' : (noteType || 'note'),
      blocks: newBlocks,
      contentChanged: true,
    }));
  }, [noteType]);
  
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [editLabelsModalOpen, setEditLabelsModalOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState(() => normalizeLabels(note.labels));
  const [newLabel, setNewLabel] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const moreOptionsTopRef = useRef(null);
  const moreOptionsBottomRef = useRef(null);
  const [activeMore, setActiveMore] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activeFormatting, setActiveFormatting] = useState({ bold: false, italic: false, underline: false });
  const colorInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [hasPickedColor, setHasPickedColor] = useState(() => !!(initialNote && initialNote.id));
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  useEffect(() => { if (initialNote && initialNote.id) setHasPickedColor(true); }, [initialNote]);
  useEffect(() => { if (isDrawingActive && typeof debouncedSave?.cancel === 'function') debouncedSave.cancel(); }, [isDrawingActive]);
  
  useEffect(() => {
    if (initialNote && initialNote.labels) {
      setSelectedLabels(normalizeLabels(initialNote.labels));
    }
  }, [initialNote]);
  
  useEffect(() => {
    if (typeof onLabelsChange === 'function') {
      onLabelsChange(selectedLabels);
    }
  }, [selectedLabels, onLabelsChange]);
  
  useEffect(() => {
    const ref = activeMore === 'top' ? moreOptionsTopRef.current : moreOptionsBottomRef.current;
    if (showMoreOptions && ref) {
      const buttonRect = ref.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = buttonRect.bottom;
      let left = buttonRect.left;
      
      if (top + 240 > viewportHeight) {
        top = Math.max(8, buttonRect.top - 240);
      }
      
      if (left + 208 > viewportWidth) {
        left = Math.max(8, viewportWidth - 208);
      }
      
      if (left < 0) {
        left = 0;
      }
      
      setDropdownPosition({ top, left });
    }
  }, [showMoreOptions, activeMore]);
  
  useEffect(() => {
    const activeBlock = note.blocks.find(b => b.id === activeBlockId && b.type === BLOCK_TYPES.TEXT);
    if (activeBlock) {
      setActiveFormatting({
        bold: !!(activeBlock.formatting?.bold),
        italic: !!(activeBlock.formatting?.italic),
        underline: !!(activeBlock.formatting?.underline),
      });
    } else {
      setActiveFormatting({ bold: false, italic: false, underline: false });
    }
  }, [activeBlockId, note.blocks]);
  
  useEffect(() => {
    const handleScroll = () => setShowMoreOptions(false);
    const handleResize = () => setShowMoreOptions(false);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleSaveNote = async (opts = {}) => {
    const { closeAfterSave = false } = opts;
    const textBlocks = note.blocks.filter(block => block.type === BLOCK_TYPES.TEXT);
    const content = textBlocks.map(block => block.data || '').join('\n').trim();
    const content_html = textBlocks.map(b => {
      let inner = escapeHtml(b.data).replace(/\n/g, '<br/>');
      if (b?.formatting?.bold) inner = `<strong>${inner}</strong>`;
      if (b?.formatting?.italic) inner = `<em>${inner}</em>`;
      if (b?.formatting?.underline) inner = `<u>${inner}</u>`;
      return `<p>${inner}</p>`;
    }).join('');
    
    const resolvedType = note.type || (noteType === 'text' ? 'note' : (noteType || 'note'));
    
    const checklistBlocks = note.blocks.filter(block => block.type === BLOCK_TYPES.CHECKLIST);
    const listItems = checklistBlocks.flatMap(block => Array.isArray(block.data) ? block.data : []);
    
    const drawingBlocks = note.blocks.filter(block => block.type === BLOCK_TYPES.DRAWING);
    const bakedImages = await Promise.all(
      drawingBlocks.map(b => bakeImageWithBg(b?.data?.image, b?.data?.bgColor))
    );
    const drawingImages = bakedImages.filter(u => typeof u === 'string' && u.trim() !== '');
    
    let drawing_data = '';
    if (drawingImages.length === 1) {
      drawing_data = drawingImages[0];
    } else if (drawingImages.length > 1) {
      try {
        drawing_data = JSON.stringify(drawingImages);
      } catch {
        drawing_data = drawingImages.join(',');
      }
    }
    
    const imageBlocks = note.blocks.filter(block => block.type === BLOCK_TYPES.IMAGE);
    const imageUrls = imageBlocks.map(b => (b?.data?.base64 || b?.data?.url)).filter(u => typeof u === 'string' && u.trim() !== '');
    
    let image_url = '';
    if (imageUrls.length === 1) {
      image_url = imageUrls[0];
    } else if (imageUrls.length > 1) {
      try {
        image_url = JSON.stringify(imageUrls);
      } catch {
        image_url = imageUrls.join(',');
      }
    }
    
    const saveData = {
      reminder: note.reminder,
      ...note,
      type: resolvedType,
      content: resolvedType === 'note' ? content_html : content,
      content_html: content_html,
      listItems: listItems,
      drawing_data: drawing_data,
      image_url: image_url,
      labels: selectedLabels,
      lastModified: new Date()
    };
    
    if (closeAfterSave) {
      if (note.id) {
        Promise.resolve(onSave?.(note.id, saveData));
      } else {
        Promise.resolve(onSave?.(saveData));
      }
      onCancel?.();
      return;
    }
    if (note.id) {
      await onSave?.(note.id, saveData);
    } else {
      await onSave?.(saveData);
    }
  };
  
  const debouncedSave = useDebouncedCallback(() => {
    if (note.contentChanged && note.id) {
      handleSaveNote({ closeAfterSave: false });
    }
  }, 2000);
  
  useEffect(() => {
    if (note.contentChanged && note.id && !isDrawingActive) {
      debouncedSave();
    }
  }, [note, debouncedSave, selectedLabels, isDrawingActive]);
  
  const update = (updater) => setNote(n => ({ ...updater(n), contentChanged: true }));
  const updateTitle = (title) => update(n => ({ ...n, title }));
  const updateBlock = (blockId, data) => update(n => ({
    ...n,
    blocks: n.blocks.map(b => (b.id === blockId ? { ...b, data } : b)),
  }));
  
  const addBlock = (type, index) => update(n => ({
    ...n,
    blocks: [
      ...n.blocks.slice(0, index + 1),
      createEmptyBlock(type),
      ...n.blocks.slice(index + 1),
    ],
  }));
  
  const removeBlock = (blockId) => update(n => ({ ...n, blocks: n.blocks.filter(b => b.id !== blockId) }));
  
  const splitBlock = (index, textAfter) => update(n => {
    const newBlocks = [...n.blocks];
    const nextBlock = createEmptyBlock(BLOCK_TYPES.TEXT);
    nextBlock.formatting = {
      bold: !!(newBlocks[index]?.formatting?.bold),
      italic: !!(newBlocks[index]?.formatting?.italic),
      underline: !!(newBlocks[index]?.formatting?.underline),
    };
    newBlocks.splice(index + 1, 0, nextBlock);
    newBlocks[index + 1].data = textAfter;
    return { ...n, blocks: newBlocks };
  });
  
  const handleSetReminder = (date) => {
    setNote(prev => ({ ...prev, reminder: date }));
    setShowReminderPicker(false);
  };
  
  const removeReminder = () => setNote(prev => ({ ...prev, reminder: null }));
  
  const toggleLabel = (labelId) => {
    const id = String(labelId);
    setSelectedLabels(prev => (prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]));
  };
  
  const handleAddNewLabel = async () => {
    const name = newLabel.trim();
    if (!name) return;
    
    try {
      const res = await fetch(LABELS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      let newId = null;
      if (res.ok) {
        const data = await res.json();
        newId = data.id ?? null;
      }
      
      const labelEntry = newId ? { id: newId, name } : { id: name, name };
      const list = Array.isArray(allLabels) ? allLabels : [];
      const exists = list.some(l => String(l.id ?? l.name) === String(labelEntry.id));
      
      if (!exists) setAllLabels?.([...list, labelEntry]);
      setSelectedLabels(prev => (prev.includes(String(labelEntry.id)) ? prev : [...prev, String(labelEntry.id)]));
      setNewLabel('');
    } catch (e) {
      const list = Array.isArray(allLabels) ? allLabels : [];
      const labelEntry = { id: name, name };
      const exists = list.some(l => String(l.id ?? l.name) === name);
      
      if (!exists) setAllLabels?.([...list, labelEntry]);
      setSelectedLabels(prev => (prev.includes(name) ? prev : [...prev, name]));
      setNewLabel('');
    }
  };
  
  const handleLabelsChange = (labels) => setSelectedLabels(labels);
  
  const getActiveTextBlock = () => note.blocks.find(b => b.id === activeBlockId && b.type === BLOCK_TYPES.TEXT);
  
  const updateBlockFormatting = (blockId, patch) => update(n => ({
    ...n,
    blocks: n.blocks.map(b =>
      b.id === blockId
        ? {
          ...b,
          formatting: {
            bold: !!(b.formatting?.bold),
            italic: !!(b.formatting?.italic),
            underline: !!(b.formatting?.underline),
            ...patch,
          },
        }
        : b
    ),
  }));
  
  const toggleActiveFormatting = (key) => {
    let blk = getActiveTextBlock();
    if (!blk) {
      const lastText = [...note.blocks].reverse().find(b => b.type === BLOCK_TYPES.TEXT);
      if (!lastText) return;
      
      setActiveBlockId(lastText.id);
      const currentLast = !!(lastText.formatting?.[key]);
      updateBlockFormatting(lastText.id, { [key]: !currentLast });
      return;
    }
    
    const current = !!(blk.formatting?.[key]);
    updateBlockFormatting(blk.id, { [key]: !current });
  };
  
  const handleAddBlock = (type) => addBlock(type, note.blocks.length - 1);
  
  const toggleFormattingForBlock = (blockId, key) => {
    const blk = note.blocks.find(b => b.id === blockId && b.type === BLOCK_TYPES.TEXT);
    if (!blk) return;
    
    const current = !!(blk.formatting?.[key]);
    updateBlockFormatting(blockId, { [key]: !current });
  };
  
  const handleMoreOptionsClick = (source, e) => {
    e?.stopPropagation?.();
    setActiveMore(source);
    setShowMoreOptions(prev => (source === activeMore ? !prev : true));
  };
  
  return (
    <div className={clsx(isModal ? 'w-full' : 'min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4')}>
      {!isModal && (
        <>
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682257-2f9c37a3a7f3?auto=format&fit=crop&q=80&w=2070')] opacity-5 bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10"></div>
          </div>

          {/* Floating Shapes */}
          <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-teal-300 opacity-20 blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-cyan-300 opacity-20 blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-blue-300 opacity-20 blur-xl"></div>
        </>
      )}

      <div className={clsx('relative z-10 w-full', isModal ? '' : 'max-w-4xl')}>
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          
          <div
            className={clsx(
              'note-editor relative flex flex-col w-full',
              isModal ? 'max-w-none max-h-[80vh] overflow-y-auto' : 'mx-auto',
              isModal ? 'space-y-6' : 'space-y-4',
              isModal ? '' : 'max-h-[90vh] overflow-y-auto',
            )}
            style={{ backgroundColor: (note?.id || hasPickedColor) ? note.color : 'transparent' }}
          >
            {/* Title and Actions (Save for new notes + Pin) */}
            <div className="flex justify-between items-center mb-4 px-8 pt-6">
              <TitleField
                value={note.title}
                onChange={updateTitle}
                darkMode={darkMode}
              />
              <div className="flex items-center gap-2">
                {!note?.id && (
                  <button
                    type="button"
                    aria-label="Save"
                    className="px-3 py-2 rounded-xl transition-all duration-200 bg-teal-600 text-white hover:bg-teal-700 inline-flex items-center gap-2"
                    onClick={() => handleSaveNote({ closeAfterSave: true })}
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                )}
                <button
                  onClick={() => setNote(n => ({ ...n, pinned: !n.pinned }))}
                  className={clsx(
                    'ml-2 p-2 rounded-xl transition-all duration-200 transform hover:scale-110',
                    note.pinned
                      ? 'text-yellow-500 bg-yellow-500/10'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                  aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                  title={note.pinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin className={`w-5 h-5 ${note.pinned ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

                        
            {/* Blocks Container */}
            <div className="flex-1 pb-32 px-8">
              <div className="blocks space-y-4">
                {note.blocks.map((block, idx) => (
                  <Block
                    key={block.id}
                    block={block}
                    onUpdate={(data) => updateBlock(block.id, data)}
                    onRemove={() => removeBlock(block.id)}
                    onSplit={(textAfter) => splitBlock(idx, textAfter)}
                    darkMode={darkMode}
                    onFocus={() => setActiveBlockId(block.id)}
                    onToggleFormatting={toggleFormattingForBlock}
                    onDrawingActive={setIsDrawingActive}
                  />
                ))}
              </div>
            </div>
            
            {/* Toolbar - Google Keep style row */}
            <div className={clsx(
              !note?.id
                ? 'fixed left-1/2 -translate-x-1/2 bottom-4 w-[calc(100%-2rem)] max-w-4xl z-40'
                : 'sticky bottom-0 z-20 mx-4 mb-4',
              'flex flex-nowrap overflow-x-auto whitespace-nowrap items-center gap-1 p-2 rounded-xl bg-white/95 backdrop-blur-lg border border-white/20 shadow-lg'
            )}>
              {/* Row of icons */}
              <div className="flex items-center space-x-1">
                {/* Background color */}
                <button
                  type="button"
                  aria-label="Background color"
                  className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                  onClick={() => colorInputRef.current && colorInputRef.current.click()}
                  title="Background color"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={note.color}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNote(n => ({ ...n, color: v, contentChanged: true }));
                    setHasPickedColor(true);
                    onColorChange?.(v);
                  }}
                  className="hidden"
                />

                {/* Reminder */}
                <button
                  type="button"
                  aria-label="Set reminder"
                  className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                  onClick={() => setShowReminderPicker(true)}
                  title="Set reminder"
                >
                  <Bell className="w-4 h-4" />
                </button>

                {/* Collaborator */}
                <button
                  type="button"
                  aria-label="Add collaborators"
                  className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                  title="Add collaborators"
                >
                  <UserPlus className="w-4 h-4" />
                </button>

                {/* Add Image */}
                <button
                  type="button"
                  aria-label="Add image"
                  className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                  onClick={() => imageInputRef.current && imageInputRef.current.click()}
                  title="Add image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = () => {
                      const dataUrl = String(r.result || '');
                      setNote(n => ({
                        ...n,
                        blocks: [...n.blocks, { id: generateId(), type: BLOCK_TYPES.IMAGE, data: { base64: dataUrl } }],
                        contentChanged: true,
                      }));
                    };
                    r.readAsDataURL(f);
                    e.target.value = '';
                  }}
                />

                {/* Archive */}
                <button
                  type="button"
                  aria-label={note.status === 'archived' ? 'Unarchive note' : 'Archive note'}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    note.status === 'archived'
                      ? 'text-amber-700 hover:bg-amber-100'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setNote(n => ({ ...n, status: n.status === 'archived' ? 'active' : 'archived', contentChanged: true }))}
                  title={note.status === 'archived' ? 'Unarchive note' : 'Archive note'}
                >
                  <Archive className="w-4 h-4" />
                </button>

                {/* More */}
                <div className="relative">
                  <button
                    ref={moreOptionsBottomRef}
                    type="button"
                    aria-label="More options"
                    className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                    onClick={(e) => handleMoreOptionsClick('bottom', e)}
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMoreOptions && createPortal(
                    <div className="fixed inset-0 z-[13000] bg-black/30 flex items-center justify-center" onClick={() => setShowMoreOptions(false)}>
                      <div
                        className={`${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} rounded-2xl shadow-2xl border w-[18rem] max-w-[92vw] py-2`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={`w-full text-left px-3 py-2 ${darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-100'} flex items-center gap-2`}
                          onClick={() => { setEditLabelsModalOpen(true); setShowMoreOptions(false); }}
                        >
                          <Tag className="w-4 h-4" /> Add label
                        </button>
                        <button
                          className={`w-full text-left px-3 py-2 ${darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-100'} flex items-center gap-2`}
                          onClick={() => { setNote(n => ({ ...n, blocks: [...n.blocks, { id: generateId(), type: BLOCK_TYPES.DRAWING, data: null }], contentChanged: true })); setShowMoreOptions(false); }}
                        >
                          <Edit3 className="w-4 h-4" /> Add drawing
                        </button>
                        <button
                          className={`w-full text-left px-3 py-2 ${darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-100'} flex items-center gap-2`}
                          onClick={() => {
                            setNote(n => {
                              const hasChecklist = n.blocks.some(b => b.type === BLOCK_TYPES.CHECKLIST);
                              const newBlocks = hasChecklist ? n.blocks : [{ id: generateId(), type: BLOCK_TYPES.CHECKLIST, data: [{ id: generateId(), text: '', checked: false }] }, ...n.blocks];
                              return { ...n, type: 'list', blocks: newBlocks, contentChanged: true };
                            });
                            setShowMoreOptions(false);
                          }}
                        >
                          <CheckSquare className="w-4 h-4" /> Show checkboxes
                        </button>
                        <button
                          className={`w-full text-left px-3 py-2 disabled:opacity-50 cursor-not-allowed flex items-center gap-2`}
                          disabled
                        >
                          <Undo className="w-4 h-4" /> Version history
                        </button>
                        {note?.id && (
                          <>
                            <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} my-1 border-t`}></div>
                            <button
                              className={`w-full text-left px-3 py-2 ${darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'} flex items-center gap-2`}
                              onClick={() => { setShowMoreOptions(false); onDelete?.(note.id); }}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>

              {/* spacer */}
              <div className="flex-1"></div>

              {/* Undo / Redo */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  aria-label="Undo"
                  className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Redo"
                  className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              {/* Save and Close */}
              <button
                type="button"
                aria-label="Save"
                className={`px-3 py-2 rounded-xl transition-all duration-200 bg-teal-600 text-white hover:bg-teal-700 inline-flex items-center gap-2`}
                onClick={() => handleSaveNote({ closeAfterSave: true })}
                title="Save"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>

              {/* Close */}
              <button
                type="button"
                aria-label="Close"
                className={`ml-1 p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
                onClick={() => onCancel?.()}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Reminder Picker Modal */}
            {showReminderPicker && createPortal(
              <div className="fixed inset-0 z-[11000] flex items-start justify-center bg-black/50" onClick={() => setShowReminderPicker(false)}>
                <div
                  className={`bg-white rounded-2xl shadow-2xl p-6 mt-16 ring-1 ring-black/10 max-w-md w-full mx-4`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-medium mb-4 text-lg">Set reminder</h3>
                  <ReminderPicker
                    reminder={note.reminder}
                    setReminder={handleSetReminder}
                    onClose={() => setShowReminderPicker(false)}
                  />
                </div>
              </div>,
              document.body
            )}
            
            {/* Labels Modal */}
            {editLabelsModalOpen && createPortal(
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[11000]" onClick={() => setEditLabelsModalOpen(false)}>
                <div className={`rounded-2xl p-6 max-w-md w-full bg-white shadow-2xl mx-4`} onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Edit Labels</h3>
                    <button
                      onClick={() => setEditLabelsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddNewLabel(); }}
                      placeholder="Create new label"
                      className={`flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700`}
                    />
                    <button
                      onClick={handleAddNewLabel}
                      className={`px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-2">
                    {Array.isArray(allLabels) && allLabels.length > 0 ? (
                      allLabels
                        .map((l) => (typeof l === 'string' ? { id: l, name: l } : { id: l.id ?? l.name, name: l.name ?? String(l.id) }))
                        .map((labelObj) => (
                          <label key={labelObj.id} className="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedLabels.includes(String(labelObj.id))}
                              onChange={() => toggleLabel(labelObj.id)}
                              className="rounded text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-gray-700">{labelObj.name}</span>
                          </label>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 p-3 text-center">No labels yet</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      onClick={() => setEditLabelsModalOpen(false)}
                      className="px-4 py-2 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleLabelsChange(selectedLabels);
                        setEditLabelsModalOpen(false);
                      }}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
            
                      </div>
        </div>
      </div>
    </div>
  );
};

// -------------------
// SUBCOMPONENTS
// -------------------
function TitleField({ value, onChange, darkMode }) {
  const textareaRef = useRef(null);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };
      resize();
      textarea.addEventListener('input', resize);
      return () => textarea.removeEventListener('input', resize);
    }
  }, [value]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };
  
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder="Title"
      className={clsx('w-full resize-none bg-transparent outline-none text-xl md:text-2xl font-bold', darkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-900 placeholder-gray-500')}
      style={{
        minHeight: '32px',
      }}
    />
  );
}

function Block({ block, onUpdate, onRemove, onSplit, darkMode, onFocus, onToggleFormatting, onDrawingActive }) {
  switch (block.type) {
    case BLOCK_TYPES.TEXT:
      return (
        <TextBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onSplit={onSplit}
          darkMode={darkMode}
          onFocus={onFocus}
          onToggleFormatting={onToggleFormatting}
        />
      );
    case BLOCK_TYPES.CHECKLIST:
      return (
        <ChecklistBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          darkMode={darkMode}
        />
      );
    case BLOCK_TYPES.IMAGE:
      return (
        <ImageBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          darkMode={darkMode}
        />
      );
    case BLOCK_TYPES.DRAWING:
      return (
        <DrawingBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          darkMode={darkMode}
          onDrawingActive={onDrawingActive}
        />
      );
    default:
      return null;
  }
}

function TextBlock({ block, onUpdate, onRemove, onSplit, darkMode, onFocus, onToggleFormatting }) {
  const ref = useRef(null);
  const [value, setValue] = useState(block.data || '');
  
  useEffect(() => setValue(block.data || ''), [block.data]);
  
  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };
      resize();
      textarea.addEventListener('input', resize);
      return () => textarea.removeEventListener('input', resize);
    }
  }, [value]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const el = ref.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      
      onUpdate(before);
      onSplit(after);
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
      e.preventDefault();
      const map = { b: 'bold', i: 'italic', u: 'underline' };
      const key = map[e.key];
      if (key) onToggleFormatting?.(block.id, key);
    }
  };
  
  return (
    <div className="relative group">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => { setValue(e.target.value); onUpdate(e.target.value); }}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder="Write something..."
        className={clsx('w-full resize-none bg-transparent outline-none text-base md:text-lg', darkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-700 placeholder-gray-500')}
        style={{
          fontWeight: block?.formatting?.bold ? 'bold' : 'normal',
          fontStyle: block?.formatting?.italic ? 'italic' : 'normal',
          textDecoration: block?.formatting?.underline ? 'underline' : 'none',
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-gray-100 transition-all"
        title="Remove block"
      >
        <Trash2 className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}

function ChecklistBlock({ block, onUpdate, onRemove, darkMode }) {
  const items = Array.isArray(block.data) ? block.data : [];
  
  const toggleItem = (id) => {
    const updated = items.map(it => it.id === id ? { ...it, checked: !it.checked } : it);
    onUpdate(updated);
  };
  
  const updateText = (id, text) => {
    const updated = items.map(it => it.id === id ? { ...it, text } : it);
    onUpdate(updated);
  };
  
  const addItem = () => {
    const newItem = { id: generateId(), text: '', checked: false };
    onUpdate([...items, newItem]);
  };
  
  const removeItem = (id) => {
    const updated = items.filter(it => it.id !== id);
    onUpdate(updated);
  };
  
  return (
    <div className="space-y-2">
      {items.map(it => (
        <div key={it.id} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={!!it.checked}
            onChange={() => toggleItem(it.id)}
            className="mt-1.5 rounded text-teal-600 focus:ring-teal-500"
          />
          <input
            type="text"
            value={it.text}
            onChange={(e) => updateText(it.id, e.target.value)}
            placeholder="List item"
            className={clsx('flex-1 bg-transparent outline-none border-b border-transparent focus:border-teal-400 pb-1', darkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-700')}
          />
          <button
            type="button"
            onClick={() => removeItem(it.id)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors`}
            title="Remove item"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm text-teal-600 hover:bg-teal-50 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add item
      </button>
      
      <div>
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 px-3 py-1.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Remove checklist
        </button>
      </div>
    </div>
  );
}

function ImageBlock({ block, onUpdate, onRemove, darkMode }) {
  const url = block?.data?.url || block?.data?.base64 || '';
  
  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ ...(block.data || {}), base64: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className={`border border-gray-200 rounded-2xl p-4 bg-white/50 backdrop-blur-sm`}>
      <div className="w-full h-[22rem] md:h-[28rem] rounded-xl overflow-hidden flex items-center justify-center shadow-inner bg-gray-50 border border-gray-200">
        {url ? (
          <img src={url} alt="Uploaded" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-sm text-gray-500">No image selected</div>
        )}
      </div>
      
      <div className="mt-3 flex gap-2 flex-wrap">
        <input
          type="text"
          value={block?.data?.url || ''}
          onChange={(e) => onUpdate({ ...(block.data || {}), url: e.target.value })}
          placeholder="Paste image URL"
          className={`flex-1 bg-white outline-none border border-gray-300 rounded-xl px-4 py-2 text-gray-700 min-w-0`}
        />
        <label className={`px-4 py-2 rounded-xl cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors`}>
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
        <button
          type="button"
          onClick={onRemove}
          className={`px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors`}
        >
          Remove image
        </button>
      </div>
    </div>
  );
}

function DrawingBlock({ block, onUpdate, onRemove, darkMode, onDrawingActive }) {
  const image = block?.data?.image || '';
  
  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ ...(block.data || {}), image: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className={`border border-gray-200 rounded-2xl p-4 bg-white/50 backdrop-blur-sm`}>
      <div
        onPointerDown={() => onDrawingActive?.(true)}
        onPointerUp={() => onDrawingActive?.(false)}
        onPointerCancel={() => onDrawingActive?.(false)}
        onPointerLeave={() => onDrawingActive?.(false)}
      >
        <DrawingCanvas
          onSave={(dataUrl) => onUpdate({ ...(block.data || {}), image: String(dataUrl) })}
          initialDrawingData={image}
          darkMode={darkMode}
          showControls={true}
          setDrawingColor={(color) => onUpdate({ ...(block.data || {}), drawingColor: color })}
          drawingColor={block?.data?.drawingColor}
        />
      </div>
      
      <div className="mt-3 flex gap-2">
        <label className={`px-4 py-2 rounded-xl cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors`}>
          Upload drawing
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
        <button
          type="button"
          onClick={onRemove}
          className={`px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors`}
        >
          Remove drawing
        </button>
      </div>
    </div>
  );
}

function ActionBar({ note, setNote, onDelete, onCancel, darkMode, setShowReminderPicker, setEditLabelsModalOpen }) {
  return (
    <div className="sticky bottom-2 z-30 mt-1 flex items-center gap-2 p-4 m-4 rounded-xl bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg">
      <span className="hidden sm:inline text-xs text-gray-600 mr-2">Press Esc to cancel</span>
      
      <button
        type="button"
        aria-label="Set reminder"
        className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
        onClick={() => setShowReminderPicker(true)}
      >
        <Bell className="w-4 h-4 inline mr-2" /> Reminder
      </button>
      
      <button
        type="button"
        aria-label="Add collaborators"
        className={`p-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-200`}
      >
        <UserPlus className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        aria-label={note.status === 'archived' ? 'Unarchive note' : 'Archive note'}
        className={`p-2 rounded-xl transition-all duration-200 ${
          note.status === 'archived'
            ? 'text-amber-700 hover:bg-amber-100'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setNote(n => ({ ...n, status: n.status === 'archived' ? 'active' : 'archived', contentChanged: true }))}
      >
        <Archive className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        aria-label="Delete"
        className={`px-3 py-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors`}
        onClick={() => {
          if (note?.id && window.confirm('Delete this note?')) {
            onDelete?.(note.id);
          }
        }}
      >
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </div>
  );
}

export default NoteEditor;