import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, RefreshCw, Grid, List, Settings, User, 
  Edit3, Archive, Trash2, Tag, Clock, FileText, 
  LogOut, HelpCircle, Moon, Sun 
} from 'lucide-react';
import SearchBar from './Search';
import DetailedSettingsPanel from './DetailedSettingsPanel';

export default function Header({ 
  allLabels = [], 
  onEditLabels = () => {}, 
  onMenuClick = () => {}, 
  onToggleView = () => {}, 
  isGridView = true,
  user = { name: "User", email: "user@example.com" }
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDetailedSettings, setShowDetailedSettings] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  const toggleView = () => onToggleView(!isGridView);
  const handleRefresh = () => window.location.reload();
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSettings = () => setSettingsOpen(prev => !prev);
  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Menu structure for dynamic rendering
  const menuItems = [
    { 
      title: "Notes", 
      icon: <FileText className="h-5 w-5 text-gray-600" />,
      onClick: () => handleMenuItemClick('Notes')
    },
    { 
      title: "Reminders", 
      icon: <Clock className="h-5 w-5 text-gray-600" />,
      onClick: () => handleMenuItemClick('Reminders')
    },
    ...allLabels.map(label => ({
      title: label,
      icon: <Tag className="h-5 w-5 text-gray-600" />,
      onClick: () => handleMenuItemClick(label)
    })),
    { 
      title: "Edit Labels", 
      icon: <Edit3 className="h-5 w-5 text-gray-600" />,
      onClick: () => handleMenuItemClick('Edit Labels')
    },
    { 
      title: "Archive", 
      icon: <Archive className="h-5 w-5 text-gray-600" />,
      onClick: () => handleMenuItemClick('Archive')
    },
    { 
      title: "Trash", 
      icon: <Trash2 className="h-5 w-5 text-gray-600" />,
      onClick: () => handleMenuItemClick('Trash')
    }
  ];

  // Handle menu item clicks
  const handleMenuItemClick = (item) => {
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

  // Toggle dark mode globally
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync darkMode state with localStorage to persist theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (savedTheme === 'light') {
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-300 dark:border-gray-700">
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Menu + Logo */}
            <div className="flex items-center">
              {/* Hamburger Menu */}
              <div className="relative mr-3">
                <button
                  aria-label="Open menu"
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-all ${menuOpen ? 'bg-amber-100 dark:bg-amber-900' : ''}`}
                  onClick={toggleMenu}
                >
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>

                {/* Menu Dropdown */}
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[calc(100vh-5rem)] overflow-auto"
                  >
                    <nav className="flex flex-col py-2">
                      {menuItems.map((item, index) => (
                        <button
                          key={`${item.title}-${index}`}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                          onClick={item.onClick}
                        >
                          {item.icon}
                          <span className="text-gray-700 dark:text-gray-300">{item.title}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>

              {/* Logo */}
              <div className="flex items-center space-x-2 select-none">
                <div className="bg-amber-500 p-2 rounded-full">
                  <img
                    src={require('../assets/note-edit-svgrepo-com.svg').default}
                    alt="Project Logo"
                    className="h-6 w-6 filter invert"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
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
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Grid/List Toggle */}
              <button
                aria-label="Toggle view"
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors ${!isGridView ? 'bg-amber-100 dark:bg-amber-900' : ''}`}
                onClick={toggleView}
              >
                {isGridView ? (
                  <Grid className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <List className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

            {/* Dark Mode Toggle */}
            <button
              aria-label="Toggle dark mode"
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              onClick={() => {
                toggleDarkMode();
                setSettingsOpen(false);
              }}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  aria-label="Settings"
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors ${settingsOpen ? 'bg-amber-100 dark:bg-amber-900' : ''}`}
                  onClick={toggleSettings}
                >
                  <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
                
                {settingsOpen && (
                  <div
                    ref={settingsRef}
                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50"
                  >
                    <div className="py-2">
                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-300" onClick={() => { setSettingsOpen(false); setShowDetailedSettings(true); }}>
                        <span className="text-white">Settings</span>
                      </button>
              <button
                className="flex items-center w-full px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-300"
                onClick={() => {
                  toggleDarkMode();
                  setSettingsOpen(false);
                }}
              >
                <span className="text-white">{darkMode ? 'Disable Dark theme' : 'Enable Dark theme'}</span>
              </button>
                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-300">
                        <span className="text-white">Send feedback</span>
                      </button>
                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-300">
                        <span className="text-white">Help</span>
                      </button>
                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-300">
                        <span className="text-white">App downloads</span>
                      </button>
                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-300">
                        <span className="text-white">Keyboard shortcuts</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  aria-label="User profile"
                  className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors ${profileOpen ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={toggleProfile}
                >
                  <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>
                </button>
                
                {profileOpen && (
                  <div
                    ref={profileRef}
                    className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-medium mb-3">
                        {user.name.charAt(0)}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <LogOut className="h-5 w-5 mr-3 text-gray-500" />
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
          onToggleDarkMode={() => {
            toggleDarkMode();
          }}
          onClose={() => setShowDetailedSettings(false)}
        />
      )}
    </>
  );
}
