import React from 'react';
import { Type, List, PenTool, Camera } from 'lucide-react';

export default function NoteTypeSelector({ darkMode, onTypeChange }) {
  const types = [
    { icon: Type, label: 'New Note', type: 'note' },
    { icon: List, label: 'New List', type: 'list' },
    { icon: PenTool, label: 'Drawing', type: 'drawing' },
    { icon: Camera, label: 'Image', type: 'image' }
  ];

  return (
    <div className={`flex justify-between p-3 rounded-xl shadow-md mb-3 ${
      darkMode 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      {types.map(({ icon: Icon, label, type }, index) => (
        <button
          key={index}
          onClick={() => onTypeChange(type)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Icon className="mr-2 h-5 w-5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
