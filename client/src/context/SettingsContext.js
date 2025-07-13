import React, { createContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const defaultSettings = {
  addItemsToBottom: false,
  moveCheckedToBottom: false,
  displayRichPreviews: false,
  enableSharing: false,
  reminderTimes: {
    morning: '08:00',
    afternoon: '13:00',
    evening: '18:00',
  },
  darkMode: false,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('userSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch {
      // ignore write errors
    }
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleDarkMode = () => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
