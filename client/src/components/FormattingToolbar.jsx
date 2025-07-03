import React from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

export default function FormattingToolbar({ darkMode }) {
  const formatButtons = [
    { icon: Bold, label: 'Bold', format: 'bold' },
    { icon: Italic, label: 'Italic', format: 'italic' },
    { icon: Underline, label: 'Underline', format: 'underline' }
  ];

  return (
    <div className="flex space-x-2">
      {formatButtons.map(({ icon: Icon, label }, index) => (
        <button
          key={index}
          type="button"
          className={
            "p-2 rounded-lg transition-colors " +
            (darkMode 
              ? "text-gray-400 hover:bg-gray-700" 
              : "text-gray-500 hover:bg-gray-200/50")
          }
          aria-label={label}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
