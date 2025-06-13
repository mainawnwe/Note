import React from 'react';

export default function DetailedSettingsPanel({ darkMode, onToggleDarkMode, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 overflow-auto max-h-[80vh]">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Settings</h2>
        <div className="space-y-4 text-gray-800 dark:text-gray-200">
          <div className="flex items-center justify-between">
            <label htmlFor="darkModeToggle" className="font-medium">Dark theme toggle</label>
            <input
              id="darkModeToggle"
              type="checkbox"
              checked={darkMode}
              onChange={onToggleDarkMode}
              className="form-checkbox h-5 w-5 text-amber-500"
            />
          </div>
          <div>
            <label className="font-medium">Add new items to the bottom</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Adds new list items to the bottom instead of top</p>
          </div>
          <div>
            <label className="font-medium">Move checked items to bottom</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Auto-moves checked items in a list</p>
          </div>
          <div>
            <label className="font-medium">Display rich link previews</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Show link previews inside notes</p>
          </div>
          <div>
            <label className="font-medium">Enable sharing</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Allow note collaboration</p>
          </div>
          <div>
            <label className="font-medium">Keyboard shortcuts (link)</label>
            <p className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer underline">View shortcut keys</p>
          </div>
          <div>
            <label className="font-medium">Help & feedback links</label>
            <p className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer underline">Quick access to support and feedback</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
