import React, { useState, useRef, useEffect } from 'react';

export default function FeedbackDropdown({ isOpen, onClose }) {
  const [feedback, setFeedback] = useState('');
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement feedback submission logic here
    console.log('Feedback submitted:', feedback);
    setFeedback('');
    onClose();
  };

  const handleCancel = () => {
    setFeedback('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-2 w-72 max-h-96 rounded-xl shadow-xl z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-feedback-title"
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          id="send-feedback-title"
          className="text-lg font-semibold text-gray-900 dark:text-white"
        >
          Send Feedback
        </h2>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Close send feedback"
        >
          &#x2715;
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="w-full h-48 p-3 border border-gray-300 rounded-md resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        />
        <div className="mt-5 flex justify-end space-x-3">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
