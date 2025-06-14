import React, { useRef, useEffect, useState } from 'react';
import { 
  Menu, RefreshCw, Grid, List, Settings, User, 
  Edit3, Archive, Trash2, Tag, Clock, FileText, 
  LogOut, HelpCircle, Moon, Sun 
} from 'lucide-react';
import SearchBar from './Search';
import DetailedSettingsPanel from './DetailedSettingsPanel';
import { useTheme } from '../context/ThemeContext';

export default function Header({ 
  allLabels = [], 
  onEditLabels = () => {}, 
  onMenuClick = () => {}, 
  onToggleView = () => {}, 
  onRefreshNotes = () => {},
  onSignOut = () => {},
  isGridView = true,
  user = { name: "User", email: "user@example.com" }
}) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDetailedSettings, setShowDetailedSettings] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Notes'); // Track active filter
  const menuRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  const toggleView = () => onToggleView(!isGridView);
  
  // Fixed refresh function - closes all dropdowns
  const handleRefresh = () => {
    setMenuOpen(false);
    setSettingsOpen(false);
    setProfileOpen(false);
    onRefreshNotes();
  };
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSettings = () => setSettingsOpen(prev => !prev);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  // Menu structure for dynamic rendering
  const menuItems = [
    { 
      id: 'notes',
      title: "Notes", 
      icon: <FileText className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('Notes')
    },
    { 
      id: 'reminders',
      title: "Reminders", 
      icon: <Clock className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('Reminders')
    },
    ...allLabels.map(label => ({
      id: `label-${label}`,
      title: label,
      icon: <Tag className="h-5 w-5" />,
      onClick: () => handleMenuItemClick(label)
    })),
    { 
      id: 'edit-labels',
      title: "Edit Labels", 
      icon: <Edit3 className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('Edit Labels')
    },
    { 
      id: 'archive',
      title: "Archive", 
      icon: <Archive className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('Archive')
    },
    { 
      id: 'trash',
      title: "Trash", 
      icon: <Trash2 className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('Trash')
    }
  ];

  // Handle menu item clicks
  const handleMenuItemClick = (item) => {
    setActiveFilter(item);
    onMenuClick(item);
    setMenuOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const closeIfOutside = (ref, setter) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setter(false);
        }
      };
      
      closeIfOutside(menuRef, setMenuOpen);
      closeIfOutside(settingsRef, setSettingsOpen);
      closeIfOutside(profileRef, setProfileOpen);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 border-b ${
        darkMode 
          ? 'bg-[#202124] border-[#5f6368]' // Google Keep dark colors
          : 'bg-white border-gray-300'      // Google Keep light colors
      } shadow-sm transition-colors duration-200`}>
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Menu + Logo */}
            <div className="flex items-center">
              {/* Hamburger Menu */}
              <div className="relative mr-3">
                <button
                  aria-label="Open menu"
                  className={`p-2 rounded-full focus:outline-none transition-all ${
                    darkMode 
                      ? 'hover:bg-[#41331C] text-gray-300' 
                      : 'hover:bg-amber-100 text-gray-700'
                  } ${menuOpen ? (darkMode ? 'bg-[#41331C]' : 'bg-amber-100') : ''}`}
                  onClick={toggleMenu}
                >
                  <Menu className="h-6 w-6" />
                </button>

                {/* Menu Dropdown */}
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className={`absolute top-full left-0 mt-2 w-64 rounded-lg shadow-xl z-50 max-h-[calc(100vh-5rem)] overflow-auto ${
                      darkMode 
                        ? 'bg-[#202124] border border-[#5f6368] text-gray-300' 
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                  >
                    <nav className="flex flex-col py-2">
                      {menuItems.map((item) => (
                        <button
                          key={item.id}
                          className={`flex items-center space-x-3 px-4 py-3 focus:outline-none transition-colors ${
                            darkMode 
                              ? 'hover:bg-[#41331C]' 
                              : 'hover:bg-amber-100'
                          } ${activeFilter === item.title ? (darkMode ? 'bg-[#41331C]' : 'bg-amber-100') : ''}`}
                          onClick={item.onClick}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>

              {/* Logo */}
              <div className="flex items-center space-x-2 select-none">
                <div className={`p-2 rounded-full ${
                  darkMode ? 'bg-[#41331C]' : 'bg-amber-500'
                }`}>
                  <img
                    src={require('../assets/note-edit-svgrepo-com.svg').default}
                    alt="Project Logo"
                    className={`h-6 w-6 ${darkMode ? 'filter invert' : ''}`}
                  />
                </div>
                <h1 className={`text-xl font-bold hidden md:block ${
                  darkMode ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  Keep Your Note
                </h1>
              </div>
            </div>

            {/* Center Section: Search Bar */}
            <div className="flex-grow max-w-2xl mx-4">
              <div className="relative">
                <SearchBar 
                  onSearch={(results) => console.log('Search results:', results)}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Right Section: Controls */}
            <div className="flex items-center space-x-2">
              {/* Refresh Button */}
              <button
                aria-label="Refresh notes"
                className={`p-2 rounded-full focus:outline-none transition-colors ${
                  darkMode 
                    ? 'hover:bg-[#41331C] text-gray-300' 
                    : 'hover:bg-amber-100 text-gray-700'
                }`}
                onClick={handleRefresh}
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              {/* Grid/List Toggle */}
              <button
                aria-label="Toggle view"
                className={`p-2 rounded-full focus:outline-none transition-colors ${
                  darkMode 
                    ? 'hover:bg-[#41331C] text-gray-300' 
                    : 'hover:bg-amber-100 text-gray-700'
                } ${!isGridView ? (darkMode ? 'bg-[#41331C]' : 'bg-amber-100') : ''}`}
                onClick={toggleView}
              >
                {isGridView ? (
                  <Grid className="h-5 w-5" />
                ) : (
                  <List className="h-5 w-5" />
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button
                aria-label="Toggle dark mode"
                className={`p-2 rounded-full focus:outline-none transition-colors ${
                  darkMode 
                    ? 'hover:bg-[#41331C] text-amber-500' 
                    : 'hover:bg-amber-100 text-gray-700'
                }`}
                onClick={() => {
                  toggleDarkMode();
                  setSettingsOpen(false);
                }}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  aria-label="Settings"
                  className={`p-2 rounded-full focus:outline-none transition-colors ${
                    darkMode 
                      ? 'hover:bg-[#41331C] text-gray-300' 
                      : 'hover:bg-amber-100 text-gray-700'
                  } ${settingsOpen ? (darkMode ? 'bg-[#41331C]' : 'bg-amber-100') : ''}`}
                  onClick={toggleSettings}
                >
                  <Settings className="h-5 w-5" />
                </button>
                
                {settingsOpen && (
                  <div
                    ref={settingsRef}
                    className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl z-50 ${
                      darkMode 
                        ? 'bg-[#202124] border border-[#5f6368]' 
                        : 'bg-white border border-gray-300'
                    }`}
                  >
                    <div className="py-2">
                      <button 
                        className={`flex items-center w-full px-4 py-2 ${
                          darkMode ? 'hover:bg-[#41331C] text-gray-300' : 'hover:bg-amber-100 text-gray-700'
                        }`}
                        onClick={() => { 
                          setSettingsOpen(false); 
                          setShowDetailedSettings(true); 
                        }}
                      >
                        <span>Settings</span>
                      </button>
                      <button
                        className={`flex items-center w-full px-4 py-2 ${
                          darkMode ? 'hover:bg-[#41331C] text-gray-300' : 'hover:bg-amber-100 text-gray-700'
                        }`}
                        onClick={() => {
                          toggleDarkMode();
                          setSettingsOpen(false);
                        }}
                      >
                        <span>{darkMode ? 'Disable Dark theme' : 'Enable Dark theme'}</span>
                      </button>
                      <button 
                        className={`flex items-center w-full px-4 py-2 ${
                          darkMode ? 'hover:bg-[#41331C] text-gray-300' : 'hover:bg-amber-100 text-gray-700'
                        }`}
                      >
                        <span>Send feedback</span>
                      </button>
                      <button 
                        className={`flex items-center w-full px-4 py-2 ${
                          darkMode ? 'hover:bg-[#41331C] text-gray-300' : 'hover:bg-amber-100 text-gray-700'
                        }`}
                      >
                        <span>Help</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  aria-label="User profile"
                  className={`p-1 rounded-full focus:outline-none transition-colors ${
                    darkMode 
                      ? 'hover:bg-[#41331C]' 
                      : 'hover:bg-amber-100'
                  } ${profileOpen ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={toggleProfile}
                >
                  <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>
                </button>
                
                {profileOpen && (
                  <div
                    ref={profileRef}
                    className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl z-50 overflow-hidden ${
                      darkMode 
                        ? 'bg-[#202124] border border-[#5f6368]' 
                        : 'bg-white border border-gray-300'
                    }`}
                  >
                    <div className={`p-4 border-b ${
                      darkMode ? 'border-[#5f6368]' : 'border-gray-300'
                    }`}>
                      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-medium mb-3">
                        {user.name.charAt(0)}
                      </div>
                      <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {user.name}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {user.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <button 
                        className={`flex items-center w-full px-4 py-2 ${
                          darkMode ? 'hover:bg-[#41331C] text-gray-300' : 'hover:bg-amber-100 text-gray-700'
                        }`}
                        onClick={() => {
                          onSignOut();
                          setProfileOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {showDetailedSettings && (
        <DetailedSettingsPanel
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onClose={() => setShowDetailedSettings(false)}
        />
      )}
    </>
  );
}