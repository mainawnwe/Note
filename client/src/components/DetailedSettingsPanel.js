
import React from 'react';
import MainMenu from './MainMenu';

export default function DetailedSettingsPanel(props) {
  return (
    <div className="fixed top-8 right-4 z-50 p-4 bg-transparent">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 overflow-auto max-h-[95vh]">
        <MainMenu {...props} />
      </div>
    </div>
  );
}
