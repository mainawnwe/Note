import React from 'react';
import { Lightbulb, Bell, Tag, Edit, Archive, Trash2, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SidebarItem = ({ icon, label, isOpen, darkMode, onClick, active = false }) => (
  <div
    onClick={onClick}
    className={`flex items-center px-4 py-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${active
        ? (darkMode
          ? 'bg-gradient-to-r from-teal-700/30 to-cyan-700/30 border-l-4 border-teal-400'
          : 'bg-gradient-to-r from-teal-100 to-cyan-100 border-l-4 border-teal-500')
        : (darkMode
          ? 'hover:bg-gray-800/50'
          : 'hover:bg-teal-50')
      }`}
  >
    <div className={`w-6 h-6 flex items-center justify-center ${active
        ? (darkMode ? 'text-teal-400' : 'text-teal-600')
        : (darkMode ? 'text-gray-400' : 'text-gray-600')
      }`}>
      {icon}
    </div>
    {isOpen && (
      <span className={`ml-3 font-medium ${active
          ? (darkMode ? 'text-teal-300' : 'text-teal-700')
          : (darkMode ? 'text-gray-300' : 'text-gray-700')
        }`}>
        {label}
      </span>
    )}
  </div>
);

function Sidebar({ collapsed, allLabels, onToggleCollapse, onTabChange, activeTab }) {
  const { darkMode } = useTheme();

  // Normalize labels to an array of objects: { id, name }
  const labels = Array.isArray(allLabels)
    ? allLabels
      .map((l) => (typeof l === 'string' ? { id: l, name: l } : l))
      .filter((l) => l && typeof l === 'object')
      .map((l) => ({
        id: String(l.id ?? l.name),
        name: String(l.name ?? l.id)
      }))
    : [];

  return (
    <div
      className={`transition-all duration-300 h-screen flex flex-col sticky top-16 ${collapsed ? 'w-16' : 'w-64'
        } ${darkMode
          ? 'bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-800'
          : 'bg-gradient-to-b from-teal-50/90 via-cyan-50/90 to-blue-50/90 border-r border-gray-200'
        }`}
    >
      {/* Menu toggle button as first sidebar item */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div
          onClick={onToggleCollapse}
          className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl cursor-pointer transition-all duration-300 ${darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-teal-400'
              : 'bg-white hover:bg-teal-50 text-teal-600 shadow-sm'
            }`}
        >
          {collapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </div>
      </div>

      <nav className="flex flex-col mt-4 space-y-1 flex-grow overflow-y-auto">
        <SidebarItem
          icon={<Lightbulb />}
          label="Notes"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('notes')}
          active={activeTab === 'notes'}
        />
        <SidebarItem
          icon={<Bell />}
          label="Reminders"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('reminders')}
          active={activeTab === 'reminders'}
        />

        {labels.length > 0 && (
          <>
            <div className={`px-4 py-2 mt-2 mb-1 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
              {!collapsed && 'Labels'}
            </div>
            {labels.map(label => (
              <SidebarItem
                key={label.id}
                icon={<Tag />}
                label={label.name}
                isOpen={!collapsed}
                darkMode={darkMode}
                onClick={() => onTabChange(label.id)}
                active={activeTab === label.id}
              />
            ))}
            <SidebarItem
              icon={<Edit />}
              label="Edit labels"
              isOpen={!collapsed}
              darkMode={darkMode}
              onClick={() => onTabChange('edit-labels')}
              active={activeTab === 'edit-labels'}
            />
          </>
        )}

        <div className={`px-4 py-2 mt-4 mb-1 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
          {!collapsed && 'System'}
        </div>

        <SidebarItem
          icon={<Archive />}
          label="Archive"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('archive')}
          active={activeTab === 'archive'}
        />
        <SidebarItem
          icon={<Trash2 />}
          label="Trash"
          isOpen={!collapsed}
          darkMode={darkMode}
          onClick={() => onTabChange('trash')}
          active={activeTab === 'trash'}
        />
      </nav>

      {/* Footer with branding */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
        {!collapsed && (
          <div className="text-center">
            <div className={`text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
              Keep Note
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'
              }`}>
              v1.0.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;