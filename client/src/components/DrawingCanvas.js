import React, { useRef, useEffect, useState } from 'react';
import { Save, XCircle, Undo2, Redo2 } from 'lucide-react';

function DrawingCanvas({ onSave, initialDrawingData, darkMode, drawingColor, showControls }) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Basic drawing state history for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      setCtx(context);

      // Set initial canvas size and background
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.fillStyle = darkMode ? '#333333' : '#ffffff'; // Canvas background
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (initialDrawingData) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
          saveState(); // Save initial state to history
        };
        img.src = initialDrawingData;
      } else {
        saveState(); // Save initial blank state
      }
    }
  }, [darkMode, initialDrawingData]); // Re-run if darkMode or initial data changes

  const saveState = () => {
    if (ctx && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      // Only add to history if it's a new state (not undo/redo)
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, dataUrl]);
      setHistoryIndex(newHistory.length);
    }
  };

  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getMousePos(canvasRef.current, e);
    setLastPos(pos);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    const currentPos = getMousePos(canvasRef.current, e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawingColor || (darkMode ? '#e0e0e0' : '#000000'); // Drawing color

    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    setLastPos(currentPos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveState(); // Save state after drawing stops
    if (canvasRef.current && typeof onSave === 'function') {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const handleSaveDrawing = () => {
    if (canvasRef.current) {
      if (typeof onSave === 'function') {
        onSave(canvasRef.current.toDataURL());
      }
    }
  };

  const handleClear = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = darkMode ? '#333333' : '#ffffff'; // Re-fill background
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveState(); // Save clear state to history
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      const prevDataUrl = history[historyIndex - 1];
      const img = new Image();
      img.onload = () => {
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.fillStyle = darkMode ? '#333333' : '#ffffff';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = prevDataUrl;
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const nextDataUrl = history[historyIndex + 1];
      const img = new Image();
      img.onload = () => {
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.fillStyle = darkMode ? '#333333' : '#ffffff';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = nextDataUrl;
    }
  };

  return (
    <div className={`relative flex flex-col items-center border rounded-md p-2 mb-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="w-full h-48 border border-dashed rounded-md cursor-crosshair"
        style={{ touchAction: 'none' }} // Prevent scrolling on touch devices
      ></canvas>
      {showControls && (
        <div className="flex space-x-2 mt-2">
          <button
            type="button"
            onClick={handleSaveDrawing}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors flex items-center text-sm"
            title="Save Drawing"
          >
            <Save size={16} className="mr-1" /> Save
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors flex items-center text-sm"
            title="Clear Drawing"
          >
            <XCircle size={16} className="mr-1" /> Clear
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-full transition-colors flex items-center text-sm ${historyIndex <= 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'}`}
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-full transition-colors flex items-center text-sm ${historyIndex >= history.length - 1 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'}`}
            title="Redo"
          >
            <Redo2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DrawingCanvas;
