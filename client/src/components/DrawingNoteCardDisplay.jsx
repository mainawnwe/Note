import React from 'react';
import { useTheme } from '../context/ThemeContext';

const DrawingNoteCardDisplay = ({ 
  drawingData, 
  content, 
  textColor, 
  isEditing, 
  searchTerm, 
  onDrawingChange 
}) => {
  const { darkMode } = useTheme();
  
  // Detect string/array image-based drawing data (data URLs or URLs)
  const imageSources = React.useMemo(() => {
    if (!drawingData) return null;
    try {
      if (typeof drawingData === 'string') {
        const s = drawingData.trim();
        if (s.startsWith('[')) {
          const arr = JSON.parse(s);
          if (Array.isArray(arr)) {
            const imgs = arr.filter(x => typeof x === 'string' && (x.startsWith('data:image') || x.startsWith('http')));
            if (imgs.length) return imgs;
          }
        }
        if (s.startsWith('data:image') || s.startsWith('http')) {
          return [s];
        }
      } else if (Array.isArray(drawingData)) {
        const imgs = drawingData.filter(x => typeof x === 'string' && (x.startsWith('data:image') || x.startsWith('http')));
        if (imgs.length) return imgs;
      } else if (typeof drawingData === 'object' && drawingData !== null) {
        if (typeof drawingData.image === 'string' && (drawingData.image.startsWith('data:image') || drawingData.image.startsWith('http'))) {
          return [drawingData.image];
        }
      }
    } catch (e) {
      console.error('Error detecting drawing images:', e);
    }
    return null;
  }, [drawingData]);
  
  // Safely parse the drawing data with error handling
  const parsedDrawingData = React.useMemo(() => {
    if (!drawingData) return { lines: [], shapes: [] };
    
    try {
      if (typeof drawingData === 'string') {
        return JSON.parse(drawingData);
      }
      return drawingData;
    } catch (error) {
      console.error('Error parsing drawing data:', error);
      return { lines: [], shapes: [] };
    }
  }, [drawingData]);
  
  // Extract drawing information with fallbacks
  const { lines = [], shapes = [], backgroundImage } = parsedDrawingData;
  
  // Function to highlight search term in text
  const highlightSearchTerm = (text) => {
    if (!searchTerm || !text) return text;
    
    try {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) 
          ? <mark key={index} className={`px-1 rounded ${darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-200 text-amber-800'}`}>{part}</mark>
          : part
      );
    } catch (error) {
      console.error('Error highlighting search term:', error);
      return text;
    }
  };
  
  // Function to render shapes
  const renderShape = (shape, index) => {
    if (!shape || !shape.type) return null;
    
    const { type, x = 0, y = 0, width = 0, height = 0, color, points } = shape;
    
    try {
      switch (type) {
        case 'rectangle':
          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                height: `${height}%`,
                backgroundColor: color || (darkMode ? '#4F46E5' : '#3B82F6'),
                borderRadius: '4px',
              }}
            />
          );
          
        case 'circle':
          return (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                height: `${height}%`,
                backgroundColor: color || (darkMode ? '#EC4899' : '#DB2777'),
              }}
            />
          );
          
        case 'line':
          return (
            <svg
              key={index}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <line
                x1={`${x}%`}
                y1={`${y}%`}
                x2={`${width}%`}
                y2={`${height}%`}
                stroke={color || (darkMode ? '#10B981' : '#059669')}
                strokeWidth="2"
              />
            </svg>
          );
          
        case 'arrow':
          return (
            <svg
              key={index}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <defs>
                <marker
                  id={`arrowhead-${index}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill={color || (darkMode ? '#F59E0B' : '#D97706')} />
                </marker>
              </defs>
              <line
                x1={`${x}%`}
                y1={`${y}%`}
                x2={`${width}%`}
                y2={`${height}%`}
                stroke={color || (darkMode ? '#F59E0B' : '#D97706')}
                strokeWidth="2"
                markerEnd={`url(#arrowhead-${index})`}
              />
            </svg>
          );
          
        case 'text':
          return (
            <div
              key={index}
              className="absolute p-1"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                color: color || (darkMode ? '#FFFFFF' : '#000000'),
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {highlightSearchTerm(points?.[0] || '')}
            </div>
          );
          
        case 'freeform':
          if (!points || !Array.isArray(points)) return null;
          
          return (
            <svg
              key={index}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <polyline
                points={points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                fill="none"
                stroke={color || (darkMode ? '#8B5CF6' : '#7C3AED')}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );
          
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering shape:', error, shape);
      return null;
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Drawing Canvas */}
      <div className="relative flex-grow overflow-hidden rounded-lg">
        {imageSources ? (
          <div className="w-full h-full max-h-64 overflow-auto p-2 flex flex-col">
            {imageSources.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Drawing ${i + 1}`}
                className="w-full h-auto object-contain rounded mb-2"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Render shapes */}
            {Array.isArray(shapes) && shapes.map((shape, index) => renderShape(shape, index))}
            
            {/* Render lines */}
            {Array.isArray(lines) && lines.map((line, index) => {
          if (!line) return null;
          
          const { x1 = 0, y1 = 0, x2 = 0, y2 = 0, color, width } = line;
          return (
            <svg
              key={`line-${index}`}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <line
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke={color || (darkMode ? '#10B981' : '#059669')}
                strokeWidth={width || 2}
              />
            </svg>
          );
        })}
          </>
        )}
        
        {/* Content Text */}
        {content && (
          <div className="mt-3 rounded-xl px-3 py-2 border bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700">
            <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${textColor || (darkMode ? 'text-gray-200' : 'text-gray-800')}`}>
              {highlightSearchTerm(content)}
            </p>
          </div>
        )}
        
        {/* Edit Mode Indicator */}
        {isEditing && (
          <div className="absolute top-2 right-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              darkMode 
                ? 'bg-teal-900/80 text-teal-300' 
                : 'bg-teal-100 text-teal-800'
            }`}>
              Edit Mode
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!imageSources && (!shapes || shapes.length === 0) && (!lines || lines.length === 0) && !content && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className={`mb-3 p-3 rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-teal-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No drawing content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingNoteCardDisplay;