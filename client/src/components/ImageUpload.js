import React, { useState, useRef } from 'react';
import { UploadCloud, Image, XCircle } from 'lucide-react';

function ImageUpload({ onUpload, initialImageUrl, darkMode }) {
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result); // Set base64 for preview
        // Send the file, URL (if uploaded to a server), and base64 to parent
        onUpload(file, null, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
    onUpload(null, null, null); // Notify parent that image is removed
  };

  return (
    <div className={`relative flex flex-col items-center justify-center border rounded-md p-4 mb-2 min-h-[150px]
      ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      {previewUrl ? (
        <div className="relative w-full max-w-[300px] max-h-60 flex justify-center items-center rounded-md overflow-hidden shadow-lg">
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
            title="Remove Image"
          >
            <XCircle size={16} />
          </button>
        </div>
      ) : (
        <div className="text-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
          <UploadCloud size={48} className={`mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click or drag to upload image</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;