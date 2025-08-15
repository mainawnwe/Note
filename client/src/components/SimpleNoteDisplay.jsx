import React from 'react';

function SimpleNoteDisplay({ content, textColor, searchTerm, contentHtml }) {
  const sanitizeHtml = (html) => {
    if (typeof html !== 'string') return '';
    let out = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/ on[a-z]+="[^"]*"/gi, '')
      .replace(/ on[a-z]+='[^']*'/gi, '');
    return out;
  };

  if (!content && !contentHtml) {
    return (
      <p className={`text-base overflow-auto max-h-40 ${textColor}`}>
        No content provided.
      </p>
    );
  }

  if (!searchTerm || searchTerm.trim() === '') {
    if (contentHtml && contentHtml.trim() !== '') {
      return (
        <div
          className={`text-base overflow-auto max-h-40 ${textColor}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }}
        />
      );
    }
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
