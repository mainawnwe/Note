import React, { useRef, useEffect, useState } from 'react';
import { Save, XCircle, Undo2, Redo2, Palette } from 'lucide-react';

function DrawingCanvas({ 
  onSave, 
  initialDrawingData, 
  darkMode, 
  drawingColor, 
  setDrawingColor,
  showControls 
}) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  // Basic drawing state history for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  // Color palette state
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  // Color options
  const colorOptions = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      setCtx(context);
      // Set initial canvas size (HiDPI aware) and background
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
      context.fillStyle = darkMode ? '#1f2937' : '#ffffff'; // Canvas background
      context.fillRect(0, 0, displayWidth, displayHeight);
      
      if (initialDrawingData) {
        const img = new Image();
        img.onload = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          context.drawImage(img, 0, 0, w, h);
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
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawingColor || (darkMode ? '#14b8a6' : '#0f766e'); // Drawing color with teal as default
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
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff'; // Re-fill background
      ctx.fillRect(0, 0, w, h);
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
          const w = canvasRef.current.clientWidth;
          const h = canvasRef.current.clientHeight;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
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
          const w = canvasRef.current.clientWidth;
          const h = canvasRef.current.clientHeight;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
        }
      };
      img.src = nextDataUrl;
    }
  };

  const handleColorSelect = (color) => {
    setDrawingColor(color);
    setShowColorPalette(false);
  };

  return (
    <div className={`relative flex flex-col items-center rounded-2xl p-4 mb-4 backdrop-blur-sm transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800/50 border border-gray-700 shadow-lg' 
        : 'bg-white/90 border border-teal-200 shadow-lg'
    }`}>
      <div className="w-full flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${
            darkMode ? 'bg-teal-900/30' : 'bg-teal-100'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-teal-400' : 'text-teal-600'
          }`}>
            Drawing Canvas
          </h3>
        </div>
        
        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPalette(!showColorPalette)}
            className={`flex items-center p-2 rounded-lg transition-all ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-teal-400' 
                : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
            }`}
            title="Select Color"
          >
            <Palette className="h-5 w-5 mr-2" />
            <div 
              className="w-5 h-5 rounded-full border border-gray-300"
              style={{ backgroundColor: drawingColor || (darkMode ? '#14b8a6' : '#0f766e') }}
            />
          </button>
          
          {/* Color Palette Dropdown */}
          {showColorPalette && (
            <div className={`absolute right-0 top-full mt-2 z-10 w-48 rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-teal-200'
            }`}>
              <div className="grid grid-cols-4 gap-2 p-3">
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                      drawingColor === color.value 
                        ? (darkMode ? 'ring-2 ring-teal-500' : 'ring-2 ring-teal-400') 
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {drawingColor === color.value && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 010-1.414l8-8z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="w-full h-[22rem] md:h-[28rem] rounded-xl border-2 cursor-crosshair transition-all duration-300 shadow-inner"
        style={{ 
          // Allow vertical scrolling in parent containers on touch devices
          touchAction: 'pan-y',
          // Prevent bounce/backdrop scroll chaining on mobile
          overscrollBehavior: 'contain',
          borderColor: darkMode ? '#374151' : '#cbd5e1'
        }}
      ></canvas>
      
      {showControls && (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleSaveDrawing}
            className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md' 
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md'
            }`}
            title="Save Drawing"
          >
            <Save className="h-5 w-5 mr-2" /> 
            <span>Save</span>
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md' 
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md'
            }`}
            title="Clear Drawing"
          >
            <XCircle className="h-5 w-5 mr-2" /> 
            <span>Clear</span>
          </button>
          
          <button
            type="button"
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
              historyIndex <= 0 
                ? (darkMode 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                ) 
                : (darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 shadow-md' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-md'
                )
            }`}
            title="Undo"
          >
            <Undo2 className="h-5 w-5" />
          </button>
          
          <button
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
              historyIndex >= history.length - 1 
                ? (darkMode 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                ) 
                : (darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 shadow-md' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-md'
                )
            }`}
            title="Redo"
          >
            <Redo2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default DrawingCanvas;