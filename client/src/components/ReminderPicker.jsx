import React, { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';

const presetOptions = [
  { label: 'Later today', time: () => {
      const now = new Date();
      now.setHours(20, 0, 0, 0);
      if (now < new Date()) {
        now.setDate(now.getDate() + 1);
      }
      return now;
    },
    icon: <Clock size={16} />
  },
  { label: 'Tomorrow', time: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      return tomorrow;
    },
    icon: <Clock size={16} />
  },
  { label: 'Next week', time: () => {
      const nextWeek = new Date();
      const day = nextWeek.getDay();
      const diff = 8 - day; // Next Monday
      nextWeek.setDate(nextWeek.getDate() + diff);
      nextWeek.setHours(8, 0, 0, 0);
      return nextWeek;
    },
    icon: <Clock size={16} />
  },
  { label: 'Home', time: null, icon: <MapPin size={16} />, subtitle: 'Myanmar (Burma)' }
];

export default function ReminderPicker({ reminder, setReminder, onClose }) {
  const [customDateTime, setCustomDateTime] = useState(reminder ? new Date(reminder).toISOString().slice(0,16) : '');

  const handlePresetClick = (timeFunc) => {
    if (!timeFunc) return;
    const time = timeFunc();
    setReminder(time.toISOString());
    onClose();
  };

  const handleCustomDateTimeChange = (e) => {
    setCustomDateTime(e.target.value);
  };

  const handleSaveCustom = () => {
    if (customDateTime) {
      setReminder(new Date(customDateTime).toISOString());
      onClose();
    }
  };

  return (
    <div className="reminder-picker p-4 bg-white rounded shadow-md w-72 text-gray-900 z-60">
      <h3 className="font-semibold mb-3 text-lg">Remind me later</h3>
      <p className="text-sm mb-4 text-gray-600">Saved in Google Reminders</p>
      <div className="mb-3 space-y-2">
        {presetOptions.map((option) => (
          <button
            key={option.label}
            className="flex items-center justify-between w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={() => handlePresetClick(option.time)}
            disabled={!option.time}
          >
            <div className="flex items-center space-x-2">
              {option.icon}
              <div>
                <div>{option.label}</div>
                {option.subtitle && <div className="text-xs text-gray-500">{option.subtitle}</div>}
              </div>
            </div>
            {option.time && (
              <span className="text-gray-500 text-sm">
                {option.time().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </button>
        ))}
        <button
          className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          onClick={() => {}}
          disabled
        >
          <MapPin size={16} />
          <span>Pick place</span>
        </button>
      </div>
      <div className="border-t border-gray-300 pt-3">
        <label className="block mb-1 font-medium" htmlFor="custom-datetime">Pick date & time</label>
        <input
          id="custom-datetime"
          type="datetime-local"
          value={customDateTime}
          onChange={handleCustomDateTimeChange}
          className="w-full border border-gray-300 rounded px-2 py-1"
          placeholder="yyyy-mm-ddThh:mm"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveCustom}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
}
