import React from 'react';

function SimpleNoteDisplay({ content, textColor, searchTerm }) {
  if (!content) {
    return (
      <p className={`text-base overflow-auto max-h-40 ${textColor}`}>
        No content provided.
      </p>
    );
  }

  if (!searchTerm || searchTerm.trim() === '') {
    return (
      <p className={`text-base overflow-auto max-h-40 ${textColor}`}>
        {content}
      </p>
    );
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = content.split(regex);

  return (
    <p className={`text-base overflow-auto max-h-40 ${textColor}`}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} style={{ backgroundColor: '#a52a2a', color: 'white' }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </p>
  );
}

export default SimpleNoteDisplay;
