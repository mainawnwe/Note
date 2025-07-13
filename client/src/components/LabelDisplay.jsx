import React from 'react';

function LabelDisplay({ labels }) {
  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {labels.map(label => (
        <span
          key={label.id || label}
          className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: label.color || '#e2e8f0', color: '#333' }}
        >
          {label.name || label}
        </span>
      ))}
    </div>
  );
}

export default LabelDisplay;
