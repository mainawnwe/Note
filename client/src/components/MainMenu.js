import React, { useState, useEffect } from 'react';

export default function MainMenu({
  darkMode,
  onToggleDarkMode,
  addItemsToBottom: propAddItemsToBottom,
  moveCheckedToBottom: propMoveCheckedToBottom,
  displayRichPreviews: propDisplayRichPreviews,
  enableSharing: propEnableSharing,
  reminderTimes: propReminderTimes,
  onSave,
  onClose,
}) {
  const [addItemsToBottom, setAddItemsToBottom] = useState(propAddItemsToBottom || false);
  const [moveCheckedToBottom, setMoveCheckedToBottom] = useState(propMoveCheckedToBottom || false);
  const [displayRichPreviews, setDisplayRichPreviews] = useState(propDisplayRichPreviews || false);
  const [enableSharing, setEnableSharing] = useState(propEnableSharing || false);

  // Reminder defaults state
  const [morningTime, setMorningTime] = useState((propReminderTimes && propReminderTimes.morning) || '08:00');
  const [afternoonTime, setAfternoonTime] = useState((propReminderTimes && propReminderTimes.afternoon) || '13:00');
  const [eveningTime, setEveningTime] = useState((propReminderTimes && propReminderTimes.evening) || '18:00');

  // Sync props to state if props change
  useEffect(() => {
    setAddItemsToBottom(propAddItemsToBottom || false);
  }, [propAddItemsToBottom]);

  useEffect(() => {
    setMoveCheckedToBottom(propMoveCheckedToBottom || false);
  }, [propMoveCheckedToBottom]);

  useEffect(() => {
    setDisplayRichPreviews(propDisplayRichPreviews || false);
  }, [propDisplayRichPreviews]);

  useEffect(() => {
    setEnableSharing(propEnableSharing || false);
  }, [propEnableSharing]);

  useEffect(() => {
    if (propReminderTimes) {
      setMorningTime(propReminderTimes.morning || '08:00');
      setAfternoonTime(propReminderTimes.afternoon || '13:00');
      setEveningTime(propReminderTimes.evening || '18:00');
    }
  }, [propReminderTimes]);

  const handleAddItemsToBottomToggle = () => {
    setAddItemsToBottom(!addItemsToBottom);
  };

  const handleMoveCheckedToBottomToggle = () => {
    setMoveCheckedToBottom(!moveCheckedToBottom);
  };

  const handleDisplayRichPreviewsToggle = () => {
    setDisplayRichPreviews(!displayRichPreviews);
  };

  const handleEnableSharingToggle = () => {
    setEnableSharing(!enableSharing);
  };

  const handleKeyboardShortcutsClick = () => {
    alert('Keyboard shortcuts:\n- Ctrl+N: New note\n- Ctrl+S: Save note\n- Ctrl+F: Search notes');
  };

  const handleHelpFeedbackClick = () => {
    alert('Help & Feedback:\nVisit our support page or send us feedback!');
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        addItemsToBottom,
        moveCheckedToBottom,
        displayRichPreviews,
        enableSharing,
        reminderTimes: {
          morning: morningTime,
          afternoon: afternoonTime,
          evening: eveningTime,
        },
      });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Settings</h2>

      <div className="space-y-6 text-gray-800 dark:text-gray-200">
        {/* Notes and Lists Section */}
        <div>
          <h3 className="text-blue-600 font-semibold mb-2">Notes and Lists</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="addItemsToBottomToggle" className="font-medium">Add new items to the bottom</label>
              <input
                id="addItemsToBottomToggle"
                type="checkbox"
                checked={addItemsToBottom}
                onChange={handleAddItemsToBottomToggle}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="moveCheckedToBottomToggle" className="font-medium">Move checked items to bottom</label>
              <input
                id="moveCheckedToBottomToggle"
                type="checkbox"
                checked={moveCheckedToBottom}
                onChange={handleMoveCheckedToBottomToggle}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="displayRichPreviewsToggle" className="font-medium">Display rich link previews</label>
              <input
                id="displayRichPreviewsToggle"
                type="checkbox"
                checked={displayRichPreviews}
                onChange={handleDisplayRichPreviewsToggle}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="darkModeToggle" className="font-medium">Enable dark theme</label>
              <input
                id="darkModeToggle"
                type="checkbox"
                checked={darkMode}
                onChange={onToggleDarkMode}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Reminder Defaults Section */}
        <div>
          <h3 className="text-blue-600 font-semibold mb-2">Reminder Defaults</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="morningTime" className="font-medium">Morning</label>
              <input
                id="morningTime"
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="afternoonTime" className="font-medium">Afternoon</label>
              <input
                id="afternoonTime"
                type="time"
                value={afternoonTime}
                onChange={(e) => setAfternoonTime(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="eveningTime" className="font-medium">Evening</label>
              <input
                id="eveningTime"
                type="time"
                value={eveningTime}
                onChange={(e) => setEveningTime(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Sharing Section */}
        <div>
          <h3 className="text-blue-600 font-semibold mb-2">Sharing</h3>
          <div className="flex items-center justify-between">
            <label htmlFor="enableSharingToggle" className="font-medium">Enable sharing</label>
            <input
              id="enableSharingToggle"
              type="checkbox"
              checked={enableSharing}
              onChange={handleEnableSharingToggle}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </div>
        </div>

        {/* Links Section */}
        <div>
          <label className="font-medium cursor-pointer" onClick={handleKeyboardShortcutsClick}>Keyboard shortcuts (link)</label>
          <p className="text-sm text-blue-600 cursor-pointer underline" onClick={handleKeyboardShortcutsClick}>View shortcut keys</p>
        </div>
        <div>
          <label className="font-medium cursor-pointer" onClick={handleHelpFeedbackClick}>Help & feedback links</label>
          <p className="text-sm text-blue-600 cursor-pointer underline" onClick={handleHelpFeedbackClick}>Quick access to support and feedback</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Save
        </button>
      </div>
    </>
  );
}
