import React from 'react';
import { X } from 'lucide-react';

function LabelDisplay({ 
  labels, 
  onLabelClick = null, 
  onLabelRemove = null,
  darkMode = false,
  size = 'md',
  maxLabels = 0,
  showMore = true
}) {
  if (!labels || labels.length === 0) {
    return null;
  }

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  // Determine how many labels to show
  const labelsToShow = maxLabels > 0 && labels.length > maxLabels 
    ? labels.slice(0, maxLabels) 
    : labels;
  
  const remainingCount = labels.length - labelsToShow.length;

  // Get text color based on background
  const getTextColor = (bgColor) => {
    if (!bgColor) return darkMode ? 'text-gray-200' : 'text-gray-800';
    
    // Simple check for dark backgrounds
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? 'text-gray-900' : 'text-gray-100';
  };

  return (
    <div className={`mt-2 flex flex-wrap gap-2 ${size === 'lg' ? 'gap-3' : 'gap-2'}`}>
      {labelsToShow.map((label) => {
        const labelId = label.id || label;
        const labelName = label.name || label;
        const labelColor = label.color || (darkMode ? '#4b5563' : '#e5e7eb');
        const textColorClass = getTextColor(labelColor);
        
        return (
          <div
            key={labelId}
            className={`
              relative group inline-flex items-center rounded-full transition-all duration-200
              hover:shadow-md hover:scale-105 cursor-default
              ${sizeClasses[size]}
              ${onLabelClick ? 'cursor-pointer' : ''}
            `}
            style={{ backgroundColor: labelColor }}
            onClick={() => onLabelClick && onLabelClick(label)}
          >
            <span className={`${textColorClass} font-medium truncate max-w-[120px]`}>
              {labelName}
            </span>
            
            {onLabelRemove && (
              <button
                className={`
                  ml-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100
                  transition-opacity duration-200 hover:bg-black/10
                  ${textColorClass}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onLabelRemove(labelId);
                }}
                aria-label={`Remove ${labelName} label`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
      
      {/* Show remaining count if there are more labels */}
      {remainingCount > 0 && showMore && (
        <div
          className={`
            inline-flex items-center justify-center rounded-full font-medium
            ${sizeClasses[size]}
            ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default LabelDisplay;