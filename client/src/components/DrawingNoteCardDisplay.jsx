import React, { useRef, useEffect, useState } from 'react';

function DrawingNoteCardDisplay({ drawingData, content, textColor, isEditing, onDrawingChange, searchTerm }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const resolveToFirstImage = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) {
      const first = data.find((u) => typeof u === 'string' && u.trim() !== '');
      return first || null;
    }
    if (typeof data === 'string') {
      // Try parse JSON array string
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const first = parsed.find((u) => typeof u === 'string' && u.trim() !== '');
          return first || null;
        }
      } catch (_) {
        // not JSON, assume data URL string
      }
      return data;
    }
    return null;
  };

  const resolveAllImages = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.filter((u) => typeof u === 'string' && u.trim() !== '');
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter((u) => typeof u === 'string' && u.trim() !== '');
        }
      } catch (_) {
        // not JSON
      }
      return [data];
    }
    return [];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;  // Add null check to prevent error
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctxRef.current = ctx;

    const imgSrc = resolveToFirstImage(drawingData);
    if (imgSrc) {
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width / 2, canvas.height / 2);
      };
      image.src = imgSrc;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [drawingData]);

  const startDrawing = ({ nativeEvent }) => {
    if (!isEditing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || !isEditing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const endDrawing = () => {
    if (!isEditing) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
    // Save drawing as data URL and notify parent
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onDrawingChange(dataUrl);
  };

  const clearCanvas = () => {
    if (!isEditing) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onDrawingChange(null);
  };

  function highlightText(text, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return text;
    }
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: '#a52a2a', color: 'white' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {isEditing ? (
        <>
          <canvas
            ref={canvasRef}
            className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm mb-2 w-full h-64"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
          />
          <button
            onClick={clearCanvas}
            className="mb-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Clear Drawing
          </button>
        </>
      ) : (
        (() => {
          const imgs = resolveAllImages(drawingData);
          if (imgs.length === 1) {
            return <img src={imgs[0]} alt="Drawing" className="max-w-full max-h-64 h-auto rounded-md shadow-sm mb-2" />;
          }
          if (imgs.length > 1) {
            return (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto w-full">
                {imgs.map((src, i) => (
                  <img key={i} src={src} alt={`Drawing ${i + 1}`} className="w-full h-32 object-contain rounded-md shadow-sm bg-white dark:bg-gray-800" />
                ))}
              </div>
            );
          }
          return (
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-xs">No Drawing</span>
            </div>
          );
        })()
      )}
      {/* This is where the content is now explicitly displayed */}
      {content && <p className={`text-sm mt-2 text-center ${textColor}`}>{highlightText(content, searchTerm)}</p>}
    </div>
  );
}

export default DrawingNoteCardDisplay;
