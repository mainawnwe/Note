import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Sun, Moon, HelpCircle, Info, Key } from 'react-feather';
import DetailedSettingsPanel from './DetailedSettingsPanel';
import FeedbackModal from './FeedbackModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import HelpModal from './HelpModal';

export default function SettingsMenu({
  darkMode,
  toggleDarkMode,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDetailedSettings, setShowDetailedSettings] = useState(false);

  // Settings state for DetailedSettingsPanel
  const [addItemsToBottom, setAddItemsToBottom] = useState(false);
  const [moveCheckedToBottom, setMoveCheckedToBottom] = useState(false);
  const [displayRichPreviews, setDisplayRichPreviews] = useState(false);
  const [enableSharing, setEnableSharing] = useState(false);
  const [reminderTimes, setReminderTimes] = useState({
    morning: '08:00',
    afternoon: '13:00',
    evening: '18:00',
  });

  // Modal open states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const settingsRef = useRef(null);

  const toggleSettings = () => setSettingsOpen(prev => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleSettings}
          className={`p-2 rounded-lg transition-all duration-200 ${darkMode
            ? 'hover:bg-gray-800/80 text-gray-300'
            : 'hover:bg-amber-100 text-gray-700'
            } ${settingsOpen ? (darkMode ? 'bg-gray-800/80' : 'bg-amber-100') : ''}`}
          aria-label="Settings"
          aria-expanded={settingsOpen}
        >
          <Settings className="h-5 w-5" />
        </button>

        {settingsOpen && (
          <div
            ref={settingsRef}
            className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${darkMode
              ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50'
              : 'bg-white border border-gray-200 shadow-gray-400/30'
              }`}
          >
            <div className="py-2">
              <button
                className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-amber-50 text-gray-700'
                  }`}
                onClick={() => {
                  setSettingsOpen(false);
                  setShowDetailedSettings(true);
                }}
              >
                <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">Settings</span>
              </button>
              <button
                className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-amber-50 text-gray-700'
                  }`}
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 mr-3 flex-shrink-0" />
                ) : (
                  <Moon className="h-5 w-5 mr-3 flex-shrink-0" />
                )}
                <span className="font-medium">{darkMode ? 'Disable dark theme' : 'Enable dark theme'}</span>
              </button>
              <button
                className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-amber-50 text-gray-700'
                  }`}
                onClick={() => {
                  setSettingsOpen(false);
                  setIsFeedbackOpen(true);
                }}
              >
                <HelpCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">Send Feedback</span>
              </button>
              <button
                className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-amber-50 text-gray-700'
                  }`}
                onClick={() => {
                  setSettingsOpen(false);
                  setIsHelpOpen(true);
                }}
              >
                <Info className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">Help</span>
              </button>
              <button
                className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-amber-50 text-gray-700'
                  }`}
                onClick={() => {
                  setSettingsOpen(false);
                  setIsKeyboardShortcutsOpen(true);
                }}
              >
                <Key className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">Keyboard shortcuts</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailedSettings && (
        <DetailedSettingsPanel
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          addItemsToBottom={addItemsToBottom}
          moveCheckedToBottom={moveCheckedToBottom}
          displayRichPreviews={displayRichPreviews}
          enableSharing={enableSharing}
          reminderTimes={reminderTimes}
          onSave={(newSettings) => {
            setAddItemsToBottom(newSettings.addItemsToBottom);
            setMoveCheckedToBottom(newSettings.moveCheckedToBottom);
            setDisplayRichPreviews(newSettings.displayRichPreviews);
            setEnableSharing(newSettings.enableSharing);
            setReminderTimes(newSettings.reminderTimes);
            setShowDetailedSettings(false);
          }}
          onClose={() => setShowDetailedSettings(false)}
        />
      )}

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <KeyboardShortcutsModal isOpen={isKeyboardShortcutsOpen} onClose={() => setIsKeyboardShortcutsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
