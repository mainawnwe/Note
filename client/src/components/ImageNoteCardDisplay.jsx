import React, { useRef, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';

function ImageNoteCardDisplay({ 
  imageData, 
  content, 
  textColor, 
  isEditing, 
  onImageChange,
  searchTerm,
  isInTrash = false,
  onRestore,
  onPermanentDelete,
  darkMode
}) {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image type
    if (!file.type.match('image.*')) {
      alert('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (Array.isArray(imageData)) {
        onImageChange([...imageData, e.target.result]);
      } else {
        onImageChange([e.target.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    if (Array.isArray(imageData)) {
      const newImages = imageData.filter((_, i) => i !== index);
      onImageChange(newImages);
    } else {
      onImageChange(null);
    }
  };

  const handleAddImageClick = () => {
    fileInputRef.current.click();
  };

  const handleRestore = () => {
    if (onRestore) onRestore();
  };

  const handlePermanentDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (onPermanentDelete) onPermanentDelete();
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

  // Helper to render a single image with remove button if editing
  const renderSingleImage = (imgSrc, index) => (
    <div key={index} className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 mb-2">
      <img 
        src={imgSrc} 
        alt={`Note attachment ${index + 1}`} 
        className="w-full h-auto max-h-40 object-contain"
        onError={(e) => {
          console.error('Image failed to load:', e);
          e.target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.textContent = 'Image failed to load';
          fallback.style.color = 'red';
          fallback.className = 'text-center text-red-500 text-xs p-2';
          e.target.parentNode.appendChild(fallback);
        }}
      />
      {isEditing && (
        <button
          onClick={() => handleRemoveImage(index)}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
          aria-label="Remove image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div 
      className="flex flex-col gap-3 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Display/Edit Area */}
      <div className="relative">
        {Array.isArray(imageData) ? (
          imageData.length > 0 ? (
            <div className="flex flex-col max-h-96 overflow-y-auto space-y-2">
              {imageData.map((imgSrc, index) => renderSingleImage(imgSrc, index))}
            </div>
          ) : isEditing ? (
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                        border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
              style={{ background: 'transparent' }}
              onClick={handleAddImageClick}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  JPEG, PNG, GIF (Max 5MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-md flex items-center justify-center mb-2" style={{ background: 'transparent' }}>
              <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
            </div>
          )
        ) : imageData ? (
          renderSingleImage(imageData, 0)
        ) : isEditing ? (
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
            style={{ background: 'transparent' }}
            onClick={handleAddImageClick}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                JPEG, PNG, GIF (Max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-md flex items-center justify-center mb-2" style={{ background: 'transparent' }}>
            <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Text Content */}
      {content && !isEditing && (
        <p className={`text-sm mt-2 ${textColor} break-words`}>
          {highlightText(content, searchTerm)}
        </p>
      )}

      {/* Trash Controls */}
      {isInTrash && (
        <div className={`absolute bottom-2 right-2 flex space-x-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleRestore}
            className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${darkMode
                ? 'bg-teal-900/30 text-teal-400 hover:bg-teal-800/50'
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            title="Restore note"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restore
          </button>
          <button
            onClick={handlePermanentDelete}
            className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${darkMode
                ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            title="Delete forever"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageNoteCardDisplay;
