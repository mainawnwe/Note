import React from 'react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Help</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          For help and support, please visit our <a href="/support" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">support page</a>.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          You can also contact us at <a href="mailto:support@example.com" className="text-blue-600 underline">support@example.com</a>.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
