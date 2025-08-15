import React from 'react';
import { Lightbulb, Bell, Tag, Edit, Archive, Trash2, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SidebarItem = ({ icon, label, isOpen, darkMode, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center px-4 py-2 cursor-pointer hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
  >
    <div className={`w-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{icon}</div>
    {isOpen && <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>}
  </div>
);

function Sidebar({ collapsed, allLabels, onToggleCollapse, onTabChange }) {
  const { darkMode } = useTheme();

  // Normalize labels to an array of objects: { id, name }
  // Supports inputs like ["Work", "Personal"] or [{ id: 'work', name: 'Work' }]
  const labels = Array.isArray(allLabels)
    ? allLabels
        .map((l) => (typeof l === 'string' ? { id: l, name: l } : l))
        .filter((l) => l && typeof l === 'object')
        .map((l) => ({ id: l.id ?? l.name, name: l.name ?? String(l.id) }))
    : [];

  return (
    <div
      className={`transition-all duration-300 h-screen flex flex-col sticky top-16 ${
        collapsed ? 'w-16' : 'w-64'
      } ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'}`}
    >
      {/* Menu toggle button as first sidebar item */}
      <nav className="flex flex-col mt-4 space-y-2">
        <SidebarItem
          icon={<Menu />}
          label="Menu"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={onToggleCollapse}
        />
        <SidebarItem
          icon={<Lightbulb />}
          label="Notes"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('notes')}
        />
        <SidebarItem
          icon={<Bell />}
          label="Reminders"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('reminders')}
        />
{labels.length > 0 && (
  <>
    {labels.map(label => (
      <SidebarItem
        key={label.id}
        icon={<Tag />}
        label={label.name}
        isOpen={!collapsed}
        darkMode={darkMode}
        onClick={() => onTabChange(label.id)}
      />
    ))}
    <SidebarItem
      icon={<Edit />}
      label="Edit labels"
      isOpen={!collapsed}
      darkMode={darkMode}
      onClick={() => onTabChange('edit-labels')}
    />
  </>
)}
        <SidebarItem
          icon={<Archive />}
          label="Archive"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('archive')}
        />
        <SidebarItem
          icon={<Trash2 />}
          label="Trash"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('trash')}
        />
      </nav>
    </div>
  );
}

export default Sidebar;
