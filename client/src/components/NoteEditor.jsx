import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';
import ReminderPicker from './ReminderPicker';
import DrawingCanvas from './DrawingCanvas';
import {
  Pin,
  Bell,
  UserPlus,
  Image as ImageIcon,
  Archive,
  Trash2,
  MoreVertical,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  X,
  CheckSquare,
  Type,
  Edit3,
  Plus,
  Palette
} from 'lucide-react';
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
// Build blocks from an initial note object, including text, list, drawing, and image types
function createBlocksFromInitial(initial, defaultType) {
  const blocks = [];
  if (initial && Array.isArray(initial.blocks) && initial.blocks.length > 0) {
    // Normalize provided blocks (ensure ids and formatting on text blocks)
    return initial.blocks.map((b) => {
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
      // Fallback to text
      return { id, type: BLOCK_TYPES.TEXT, data: String(b.data ?? ''), formatting: { bold: false, italic: false, underline: false } };
    });
  }
  if (initial) {
    // Try to reconstruct text blocks from HTML content if available
    let parsedHtmlApplied = false;
    const contentHtml = initial.content_html;
    if (typeof contentHtml === 'string' && contentHtml.trim() !== '') {
      try {
        const container = typeof document !== 'undefined' ? document.createElement('div') : null;
        if (container) {
          container.innerHTML = contentHtml;
          const paragraphs = container.querySelectorAll('p');
          const nodes = paragraphs.length ? Array.from(paragraphs) : [container];
          nodes.forEach((el) => {
            const text = el.textContent || '';
            const hasBold = !!el.querySelector('b,strong');
            const hasItalic = !!el.querySelector('i,em');
            const hasUnderline = !!el.querySelector('u');
            if (text.trim() !== '') {
              blocks.push({
                id: generateId(),
                type: BLOCK_TYPES.TEXT,
                data: text,
                formatting: { bold: hasBold, italic: hasItalic, underline: hasUnderline }
              });
            }
          });
          if (blocks.length > 0) parsedHtmlApplied = true;
        }
      } catch (e) {
        // ignore parse errors and fall back to plain content
      }
    }
    // If content_html wasn't present, attempt to parse HTML from the plain content field
    if (!parsedHtmlApplied) {
      const contentMaybeHtml = initial.content;
      if (typeof contentMaybeHtml === 'string' && /<\/?[a-z][\s\S]*>/i.test(contentMaybeHtml)) {
        try {
          const container = typeof document !== 'undefined' ? document.createElement('div') : null;
          if (container) {
            container.innerHTML = contentMaybeHtml;
            const paragraphs = container.querySelectorAll('p');
            const nodes = paragraphs.length ? Array.from(paragraphs) : [container];
            nodes.forEach((el) => {
              const text = el.textContent || '';
              const hasBold = !!el.querySelector('b,strong');
              const hasItalic = !!el.querySelector('i,em');
              const hasUnderline = !!el.querySelector('u');
              if (text.trim() !== '') {
                blocks.push({
                  id: generateId(),
                  type: BLOCK_TYPES.TEXT,
                  data: text,
                  formatting: { bold: hasBold, italic: hasItalic, underline: hasUnderline }
                });
              }
            });
            if (blocks.length > 0) parsedHtmlApplied = true;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    const content = initial.content;
    const isListType = initial.type === 'list';
    const isPlainListContent = (() => {
      if (!isListType || typeof content !== 'string') return false;
      const trimmed = content.trim();
      if (trimmed === '') return false;
      const lines = trimmed.split('\n').filter(l => l.trim() !== '');
      if (lines.length === 0) return false;
      const re = /^\s*\[(?:\s|x|X)\]\s*/;
      return lines.every(line => re.test(line));
    })();
    if (!parsedHtmlApplied && content && typeof content === 'string' && content.trim() !== '' && !isPlainListContent) {
      blocks.push({ id: generateId(), type: BLOCK_TYPES.TEXT, data: content });
    }
    const listItems = initial.listItems;
    if (Array.isArray(listItems) && listItems.length > 0) {
      const normalized = listItems.map((it) => ({
        id: it.id || generateId(),
        text: it.text || '',
        checked: !!(it.checked === true || it.checked === 1 || it.checked === '1')
      }));
      blocks.push({ id: generateId(), type: BLOCK_TYPES.CHECKLIST, data: normalized });
    }
    // Handle drawing data: support single data URL string or JSON array of strings
    let drawingData = initial.drawing_data;
    if (drawingData && typeof drawingData === 'string') {
      try {
        const parsed = JSON.parse(drawingData);
        if (Array.isArray(parsed)) {
          drawingData = parsed;
        }
      } catch (e) {
        // keep as string
      }
    }
    if (Array.isArray(drawingData)) {
      drawingData
        .filter((u) => typeof u === 'string' && u.trim() !== '')
        .forEach((u) => {
          blocks.push({ id: generateId(), type: BLOCK_TYPES.DRAWING, data: { image: u } });
        });
    } else if (drawingData && typeof drawingData === 'string' && drawingData.trim() !== '') {
      blocks.push({ id: generateId(), type: BLOCK_TYPES.DRAWING, data: { image: drawingData } });
    }
    let imageData = initial.image_url;
    if (imageData && typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          imageData = parsed;
        }
      } catch (e) {
        // keep as string
      }
    }
    if (Array.isArray(imageData)) {
      imageData
        .filter((u) => typeof u === 'string' && u.trim() !== '')
        .forEach((u) => {
          blocks.push({ id: generateId(), type: BLOCK_TYPES.IMAGE, data: { url: u } });
        });
    } else if (imageData && typeof imageData === 'string' && imageData.trim() !== '') {
      blocks.push({ id: generateId(), type: BLOCK_TYPES.IMAGE, data: { url: imageData } });
    }
  }
  if (blocks.length === 0) {
    blocks.push(createEmptyBlock(defaultType || BLOCK_TYPES.TEXT));
  }
  return blocks;
}
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
  onLabelsChange,
  currentLabel,
  allLabels,
  setAllLabels,
  onColorChange,
  initialColor,
  noteType
}) {
  /* ---------- state ---------- */
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
    // Build blocks from all available data types
    const blocks = createBlocksFromInitial(initialNote, noteType);
    return {
      ...fallback,
      ...initialNote,
      blocks: blocks
    };
  });
  useEffect(() => {
    // Only rebuild state when switching between existing notes (with a real id)
    if (!initialNote || !initialNote.id) return;
    setNote((prevNote) => {
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
        const blocks = createBlocksFromInitial(initialNote, noteType);
        return { ...fallback, ...initialNote, blocks };
      }
      return prevNote;
    });
  }, [initialNote]);
  // When creating a new note (no initialNote), rebuild blocks when noteType changes
  useEffect(() => {
    // In creation mode (no existing note id), rebuild blocks when switching type
    if (!initialNote || !initialNote.id) {
      const blockType = noteType === 'list' ? BLOCK_TYPES.CHECKLIST :
        noteType === 'drawing' ? BLOCK_TYPES.DRAWING :
          noteType === 'image' ? BLOCK_TYPES.IMAGE :
            BLOCK_TYPES.TEXT;
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
      setNote((prev) => ({
        ...prev,
        type: noteType === 'text' ? 'note' : (noteType || 'note'),
        blocks: newBlocks,
        contentChanged: true,
      }));
    }
  }, [noteType, initialNote]);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [editLabelsModalOpen, setEditLabelsModalOpen] = useState(false);
  const normalizeLabels = (arr) => Array.isArray(arr)
    ? arr.map((l) => (typeof l === 'object' && l !== null ? String(l.id ?? l.name) : String(l))).filter(Boolean)
    : [];
  const [selectedLabels, setSelectedLabels] = useState(() => normalizeLabels(note.labels));
  const [newLabel, setNewLabel] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const moreOptionsRef = useRef(null);
  const [activeBlockId, setActiveBlockId] = useState(null);
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
  // Calculate dropdown position when it's opened
  useEffect(() => {
    if (showMoreOptions && moreOptionsRef.current) {
      const buttonRect = moreOptionsRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      // Calculate the ideal position for the dropdown
      let top = buttonRect.bottom;
      let left = buttonRect.left;
      // Check if dropdown would go off the bottom of the screen
      if (top + 200 > viewportHeight) {
        // Position above the button instead
        top = buttonRect.top - 200;
      }
      // Check if dropdown would go off the right of the screen
      if (left + 192 > viewportWidth) { // 192px is the width of the dropdown
        left = viewportWidth - 192; // Align to the right edge
      }
      // Check if dropdown would go off the left of the screen
      if (left < 0) {
        left = 0; // Align to the left edge
      }
      setDropdownPosition({ top, left });
    }
  }, [showMoreOptions]);
  // Close dropdown when scrolling or resizing
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
  /* ---------- save function ---------- */
  // Ensure drawings are baked with selected background color before saving
  const bakeImageWithBg = (imageUrl, color) => new Promise((resolve) => {
    if (!imageUrl) return resolve('');
    const img = new Image();
    img.onload = () => {
      const out = document.createElement('canvas');
      out.width = img.width || 1;
      out.height = img.height || 1;
      const octx = out.getContext('2d');
      octx.fillStyle = color || '#ffffff';
      octx.fillRect(0, 0, out.width, out.height);
      octx.drawImage(img, 0, 0, out.width, out.height);
      resolve(out.toDataURL());
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
const handleSaveNote = async () => {
    // Extract content from blocks for database storage
    console.log('Current note blocks:', note.blocks);
    // Collect all text blocks once and reuse
    const textBlocks = note.blocks.filter(block => block.type === BLOCK_TYPES.TEXT);
    // Plain text content (newline-separated)
    const content = textBlocks
      .map(block => block.data || '')
      .join('\n')
      .trim();
    console.log('Extracted content:', content);
    // Build HTML content preserving block-level bold/italic/underline
    const escapeHtml = (s) => String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const content_html = textBlocks.map(b => {
      let inner = escapeHtml(b.data).replace(/\n/g, '<br/>');
      if (b?.formatting?.bold) inner = `<strong>${inner}</strong>`;
      if (b?.formatting?.italic) inner = `<em>${inner}</em>`;
      if (b?.formatting?.underline) inner = `<u>${inner}</u>`;
      return `<p>${inner}</p>`;
    }).join('');
    // Determine note type for saving
    const resolvedType = note.type || (noteType === 'text' ? 'note' : (noteType || 'note'));
    // Collect list items from all checklist blocks
    const checklistBlocks = note.blocks.filter(block => block.type === BLOCK_TYPES.CHECKLIST);
    const listItems = checklistBlocks.flatMap(block => Array.isArray(block.data) ? block.data : []);
    // Collect drawing data: support multiple drawing blocks -> JSON array, single block -> string
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
    // Collect image URLs (support multiple image blocks)
    const imageBlocks = note.blocks.filter(block => block.type === BLOCK_TYPES.IMAGE);
    const imageUrls = imageBlocks
      .map(b => (b?.data?.base64 || b?.data?.url))
      .filter(u => typeof u === 'string' && u.trim() !== '');
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
    console.log('Reminder value before saving:', note.reminder); // Log reminder value
    const saveData = {
      reminder: note.reminder, // Ensure reminder is included
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
    console.log('Saving note:', saveData);
    // For existing notes, pass (id, data). For new notes, pass (data).
    if (note.id) {
      await onSave?.(note.id, saveData);
    } else {
      await onSave?.(saveData);
    }
  };
  // Auto-save for existing notes when content changes
  const debouncedSave = useDebouncedCallback(() => {
    if (note.contentChanged && note.id) {
      handleSaveNote();
    }
  }, 2000);
  useEffect(() => {
    if (note.contentChanged && note.id) {
      debouncedSave();
    }
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
      const nextBlock = createEmptyBlock(BLOCK_TYPES.TEXT);
      // inherit formatting from current block if available
      nextBlock.formatting = {
        bold: !!(newBlocks[index]?.formatting?.bold),
        italic: !!(newBlocks[index]?.formatting?.italic),
        underline: !!(newBlocks[index]?.formatting?.underline),
      };
      newBlocks.splice(index + 1, 0, nextBlock);
      // text for next block comes from the cursor split; current block was already updated by onUpdate(before)
      newBlocks[index + 1].data = textAfter;
      return { ...n, blocks: newBlocks };
    });
  /* ---------- handlers ---------- */
  const handleSetReminder = (date) => {
    setNote(prev => ({ ...prev, reminder: date }));
    setShowReminderPicker(false);
  };
  const removeReminder = () => {
    setNote(prev => ({ ...prev, reminder: null }));
  };
  const toggleLabel = (labelId) => {
    const id = String(labelId);
    setSelectedLabels(prev => (prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]));
  };
  const handleAddNewLabel = () => {
    const name = newLabel.trim();
    if (!name) return;
    const list = Array.isArray(allLabels) ? allLabels : [];
    const exists = list.some((l) => (typeof l === 'string' ? l === name : (l.name ?? l.id) === name));
    if (!exists) {
      const updated = [...list, { id: name, name }];
      setAllLabels?.(updated);
    }
    setSelectedLabels(prev => (prev.includes(name) ? prev : [...prev, name]));
    setNewLabel('');
  };
  const handleLabelsChange = (labels) => {
    setSelectedLabels(labels);
  };
  const getActiveTextBlock = () =>
    note.blocks.find((b) => b.id === activeBlockId && b.type === BLOCK_TYPES.TEXT);
  const updateBlockFormatting = (blockId, patch) =>
    update((n) => ({
      ...n,
      blocks: n.blocks.map((b) =>
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
      const lastText = [...note.blocks].reverse().find((b) => b.type === BLOCK_TYPES.TEXT);
      if (!lastText) return;
      setActiveBlockId(lastText.id);
      const currentLast = !!(lastText.formatting?.[key]);
      updateBlockFormatting(lastText.id, { [key]: !currentLast });
      return;
    }
    const current = !!(blk.formatting?.[key]);
    updateBlockFormatting(blk.id, { [key]: !current });
  };
  const handleAddBlock = (type) => {
    addBlock(type, note.blocks.length - 1);
  };
  // Toggle formatting on a specific text block (used by keyboard shortcuts in TextBlock)
  const toggleFormattingForBlock = (blockId, key) => {
    const blk = note.blocks.find((b) => b.id === blockId && b.type === BLOCK_TYPES.TEXT);
    if (!blk) return;
    const current = !!(blk.formatting?.[key]);
    updateBlockFormatting(blockId, { [key]: !current });
    setActiveBlockId(blockId);
  };
  const handleMoreOptionsClick = (e) => {
    e.stopPropagation();
    setShowMoreOptions(!showMoreOptions);
  };
  /* ---------- render ---------- */
  const activeFormatting = (() => {
    const blk = note.blocks.find((b) => b.id === activeBlockId && b.type === BLOCK_TYPES.TEXT);
    return blk?.formatting || { bold: false, italic: false, underline: false };
  })();
  return (
    <div
      className={clsx(
        'note-editor relative flex flex-col w-full',
        isModal ? 'max-w-none max-h-[80vh] overflow-hidden' : 'max-w-2xl mx-auto',
        isModal ? 'space-y-6' : 'space-y-4',
        isModal ? '' : 'rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto',
        isModal ? '' : (darkMode ? 'bg-[#202124] text-[#bdc1c6]' : 'bg-white text-[#202124]')
      )}
      style={{ backgroundColor: note.color }}
    >
      {/* Title and Pin */}
      <div className="flex justify-between items-center mb-4">
        <TitleField
          value={note.title}
          onChange={updateTitle}
          darkMode={darkMode}
        />
        <button
          onClick={() => setNote((n) => ({ ...n, pinned: !n.pinned }))}
          className={clsx(
            'ml-2 p-2 rounded-full transition-all duration-200 transform hover:scale-110',
            note.pinned
              ? 'text-yellow-500 bg-yellow-500/10'
              : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          )}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          title={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin className={`w-5 h-5 ${note.pinned ? 'fill-current' : ''}`} />
        </button>
      </div>
      {/* Blocks */}
      <div className="flex-1 overflow-y-auto pb-64">
        <div className="blocks space-y-4">
        {note.blocks.map((block, idx) => (
          <React.Fragment key={block.id}>
            <Block
              block={block}
              onUpdate={(data) => updateBlock(block.id, data)}
              onRemove={() => removeBlock(block.id)}
              onSplit={(textAfter) => splitBlock(idx, textAfter)}
              darkMode={darkMode}
              onFocus={() => setActiveBlockId(block.id)}
              onToggleFormatting={toggleFormattingForBlock}
            />
                      </React.Fragment>
        ))}
      </div>
      </div>
      {/* Toolbar */}
      <div className={`sticky bottom-[160px] z-20 flex flex-wrap items-center gap-2 mt-6 p-3 rounded-2xl ${darkMode ? 'bg-gray-800/80' : 'bg-gray-100/80'
        } backdrop-blur-sm`}>
        {/* Text Formatting */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="Bold"
            className={`p-2 rounded-xl transition-all duration-200 ${activeFormatting.bold
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white shadow-md'
              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => toggleActiveFormatting('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Italic"
            className={`p-2 rounded-xl transition-all duration-200 ${activeFormatting.italic
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white shadow-md'
              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => toggleActiveFormatting('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Underline"
            className={`p-2 rounded-xl transition-all duration-200 ${activeFormatting.underline
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white shadow-md'
              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => toggleActiveFormatting('underline')}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        {/* Block Types */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="Add text"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => handleAddBlock(BLOCK_TYPES.TEXT)}
            title="Add text"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Add checklist"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => handleAddBlock(BLOCK_TYPES.CHECKLIST)}
            title="Add checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Add image"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => handleAddBlock(BLOCK_TYPES.IMAGE)}
            title="Add image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Add drawing"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => handleAddBlock(BLOCK_TYPES.DRAWING)}
            title="Add drawing"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        {/* Color Picker */}
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4" />
          <input
            type="color"
            value={note.color}
            onChange={(e) => { const v = e.target.value; setNote(n => ({ ...n, color: v, contentChanged: true })); onColorChange?.(v); }}
            title="Background color"
            className="w-8 h-8 p-0 border-0 cursor-pointer rounded"
          />
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="Set reminder"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => setShowReminderPicker(true)}
            title="Set reminder"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Add collaborators"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            title="Add collaborators"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Archive note"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            title="Archive note"
          >
            <Archive className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              ref={moreOptionsRef}
              type="button"
              aria-label="More options"
              className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
                }`}
              title="More options"
              onClick={handleMoreOptionsClick}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMoreOptions && createPortal(
              <div
                className="fixed z-50"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                }}
              >
                <div className={`w-48 rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'
                  } border border-gray-200 dark:border-gray-700`}>
                  <button
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors ${darkMode
                      ? 'text-red-400 hover:bg-red-900/50'
                      : 'text-red-600 hover:bg-red-50'
                      }`}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this note?')) {
                        onDelete?.(note.id);
                      }
                      setShowMoreOptions(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="Undo"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
        {/* Save button */}
        <button
          type="button"
          aria-label="Save"
          className={`p-2 rounded-xl transition-all duration-200 ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          onClick={handleSaveNote}
          title="Save note"
        >
          Save
        </button>
        {/* Current Reminder Status */}
        {note.reminder && (
          <div className={`ml-3 px-3 py-2 rounded-xl inline-flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
            <span className="text-sm">Reminder: {new Date(note.reminder).toLocaleString()}</span>
            <button
              type="button"
              className={`px-2 py-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              onClick={removeReminder}
              title="Remove reminder"
            >
              Clear
            </button>
          </div>
        )}
        {/* Close button */}
        <button
          type="button"
          aria-label="Close"
          className={`ml-auto p-2 rounded-xl transition-all duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
            }`}
          onClick={() => onCancel?.()}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Reminder Picker */}
      {showReminderPicker && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-start justify-center" onClick={() => setShowReminderPicker(false)}>
          <div
            className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-xl shadow-2xl p-4 mt-16 ring-1 ${darkMode ? 'ring-white/20' : 'ring-black/10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-medium mb-3">Set reminder</h3>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditLabelsModalOpen(false)}>
          <div className={`rounded-2xl p-6 max-w-md w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Labels</h3>
              <button
                onClick={() => setEditLabelsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNewLabel(); }}
                placeholder="Create new label"
                className={`flex-1 px-3 py-2 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
              />
              <button
                onClick={handleAddNewLabel}
                className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Add
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {Array.isArray(allLabels) && allLabels.length > 0 ? (
                allLabels
                  .map((l) => (typeof l === 'string' ? { id: l, name: l } : { id: l.id ?? l.name, name: l.name ?? String(l.id) }))
                  .map((labelObj) => (
                    <label key={labelObj.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLabels.includes(String(labelObj.id))}
                        onChange={() => toggleLabel(labelObj.id)}
                      />
                      <span>{labelObj.name}</span>
                    </label>
                  ))
              ) : (
                <p className="text-sm opacity-70">No labels yet</p>
              )}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setEditLabelsModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLabelsChange(selectedLabels);
                  setEditLabelsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
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
 * Title field - Using textarea instead of contentEditable
 *****************************************************************/
function TitleField({ value, onChange, darkMode }) {
  const [internalValue, setInternalValue] = useState(value);
  const textareaRef = useRef(null);
  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      };
      resize();
      textarea.addEventListener('input', resize);
      return () => {
        textarea.removeEventListener('input', resize);
      };
    }
  }, [internalValue]);
  return (
    <textarea
      ref={textareaRef}
      value={internalValue}
      onChange={handleChange}
      placeholder="Title"
      className={`w-full resize-none text-xl md:text-2xl font-semibold bg-transparent outline-none ${
        darkMode ? 'text-[#e8eaed] placeholder-gray-400' : 'text-[#202124] placeholder-gray-500'
      }`}
    />
  );
}
/*****************************************************************
 * Blocks and helpers
 *****************************************************************/
function Block({ block, onUpdate, onRemove, onSplit, darkMode, onFocus, onToggleFormatting }) {
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
    const el = ref.current;
    if (!el) return;
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };
    resize();
    el.addEventListener('input', resize);
    return () => el.removeEventListener('input', resize);
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
    <div className={`relative group`}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => { setValue(e.target.value); onUpdate(e.target.value); }}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder="Write something..."
        className={`w-full resize-none bg-transparent outline-none text-base md:text-lg ${
          darkMode ? 'text-[#e8eaed] placeholder-gray-500' : 'text-[#202124] placeholder-gray-500'
        }`}
        style={{
          fontWeight: block?.formatting?.bold ? 'bold' : 'normal',
          fontStyle: block?.formatting?.italic ? 'italic' : 'normal',
          textDecoration: block?.formatting?.underline ? 'underline' : 'none',
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        className={`absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 rounded-full ${
          darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
        }`}
        title="Remove block"
      >
        <Trash2 className="w-4 h-4" />
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
    onUpdate([...(items || []), newItem]);
  };
  const removeItem = (id) => {
    const updated = items.filter(it => it.id !== id);
    onUpdate(updated);
  };
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.id} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={!!it.checked}
            onChange={() => toggleItem(it.id)}
            className="mt-1"
          />
          <input
            type="text"
            value={it.text}
            onChange={(e) => updateText(it.id, e.target.value)}
            placeholder="List item"
            className={`flex-1 bg-transparent outline-none border-b border-transparent focus:border-blue-400 pb-1 ${
              darkMode ? 'text-[#e8eaed]' : 'text-[#202124]'
            }`}
          />
          <button
            type="button"
            onClick={() => removeItem(it.id)}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Remove item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm ${
          darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Plus className="w-4 h-4" />
        Add item
      </button>
      <div>
        <button
          type="button"
          onClick={onRemove}
          className={`mt-2 px-3 py-1.5 rounded-xl text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
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
    <div className={`border rounded-2xl p-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {url ? (
        <img src={url} alt="Uploaded" className="max-h-72 object-contain w-full rounded-xl" />
      ) : (
        <div className="text-sm text-gray-500">No image selected</div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={block?.data?.url || ''}
          onChange={(e) => onUpdate({ ...(block.data || {}), url: e.target.value })}
          placeholder="Paste image URL"
          className={`flex-1 bg-transparent outline-none border rounded-xl px-3 py-2 ${
            darkMode ? 'border-gray-700' : 'border-gray-300'
          }`}
        />
        <label className={`px-3 py-2 rounded-xl cursor-pointer ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
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
          className={`px-3 py-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          Remove image
        </button>
      </div>
    </div>
  );
}
function DrawingBlock({ block, onUpdate, onRemove, darkMode }) {
  const image = block?.data?.image || '';
  const [drawingColor, setDrawingColor] = useState('#000000');
  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ ...(block.data || {}), image: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className={`border rounded-2xl p-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <DrawingCanvas
        onSave={(dataUrl) => onUpdate({ ...(block.data || {}), image: String(dataUrl) })}
        initialDrawingData={image}
        darkMode={darkMode}
        drawingColor={drawingColor}
        setDrawingColor={setDrawingColor}
        showControls={true}
      />
      <div className="mt-3 flex gap-2 items-center">
        <label className={`px-3 py-2 rounded-xl cursor-pointer ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
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
          className={`px-3 py-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          Remove drawing
        </button>
      </div>
    </div>
  );
}
function ActionBar({ note, setNote, onDelete, onCancel, darkMode, setShowReminderPicker, setEditLabelsModalOpen }) {
  return (
    <div className={`sticky bottom-[80px] z-30 mt-2 flex items-center gap-2 p-3 rounded-2xl ${darkMode ? 'bg-gray-800/80' : 'bg-gray-100/80'} backdrop-blur-sm`}>
      <span className={`text-xs sm:text-sm mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Press Esc to cancel</span>
      <button
        type="button"
        className={`px-3 py-2 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}
        onClick={() => setShowReminderPicker?.(true)}
      >
        <Bell className="w-4 h-4 inline mr-2" /> Reminder
      </button>
      <button
        type="button"
        className={`px-3 py-2 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}
        onClick={() => setEditLabelsModalOpen?.(true)}
      >
        Labels
      </button>
      <button
        type="button"
        className={`ml-auto px-3 py-2 rounded-xl ${darkMode ? 'text-red-400 hover:bg-red-900/50' : 'text-red-600 hover:bg-red-50'}`}
        onClick={() => {
          if (note?.id && window.confirm('Delete this note?')) {
            onDelete?.(note.id);
          }
        }}
      >
        <Trash2 className="w-4 h-4 inline mr-2" /> Delete
      </button>
      <button
        type="button"
        className={`px-3 py-2 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}
        onClick={() => onCancel?.()}
      >
        Close
      </button>
    </div>
  );
}