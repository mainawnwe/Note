import React from 'react';

export default function FeedbackModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Send Feedback</h2>
        <textarea
          className="w-full h-32 p-2 border border-gray-300 rounded resize-none dark:bg-gray-700 dark:text-white"
          placeholder="Write your feedback here..."
        />
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert('Feedback submitted. Thank you!');
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
