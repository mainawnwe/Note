import React from 'react';

export default function AppDownloadsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">App Downloads</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Download our app for your device:
        </p>
        <ul className="list-disc list-inside space-y-2 text-blue-600">
          <li><a href="/downloads/app-windows.exe" target="_blank" rel="noopener noreferrer">Windows</a></li>
          <li><a href="/downloads/app-mac.dmg" target="_blank" rel="noopener noreferrer">Mac</a></li>
          <li><a href="/downloads/app-linux.tar.gz" target="_blank" rel="noopener noreferrer">Linux</a></li>
          <li><a href="/downloads/app-android.apk" target="_blank" rel="noopener noreferrer">Android</a></li>
          <li><a href="/downloads/app-ios.ipa" target="_blank" rel="noopener noreferrer">iOS</a></li>
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
