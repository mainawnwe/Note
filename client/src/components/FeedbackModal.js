import React, { useState, useEffect, useRef } from 'react';

export default function FeedbackModal({ isOpen, onClose }) {
  const [feedback, setFeedback] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

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
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 h-full w-full max-w-sm p-6 shadow-xl overflow-y-auto animate-slide-in-right rounded-l-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            id="feedback-modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Send Feedback
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="w-full h-32 p-2 border border-gray-300 rounded-md resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Write your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
