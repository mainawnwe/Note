import React from 'react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Ctrl + N</strong>: New note</li>
          <li><strong>Ctrl + S</strong>: Save note</li>
          <li><strong>Ctrl + F</strong>: Search notes</li>
          <li><strong>Ctrl + D</strong>: Delete note</li>
          <li><strong>Ctrl + Z</strong>: Undo</li>
        </ul>
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
