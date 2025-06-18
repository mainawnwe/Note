import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, Tag, Edit3, Archive, Trash2,
  Menu, ChevronUp, ChevronDown, Grid, List,
  RefreshCw, Sun, Moon, Settings, HelpCircle, LogOut
} from 'react-feather';
import SearchBar from './Search';
import DetailedSettingsPanel from './DetailedSettingsPanel';
import FeedbackModal from './FeedbackModal';
import SettingsMenu from './SettingsMenu';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Header({
  isGridView,
  onToggleView = () => { },
  onRefreshNotes = () => { },
  onMenuClick = () => { },
  user = {},
  onSignOut = () => { },
  allLabels = [],
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused
}) {
  const { darkMode, toggleDarkMode } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Notes');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  // Toggle functions
  const toggleView = () => {
    onToggleView(!isGridView);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  // Removed toggleSettings and settingsOpen state as they are now handled in SettingsMenu
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const handleRefresh = async () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setIsRefreshing(true);
    try {
      await onRefreshNotes();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveFilter(item);
    onMenuClick(item);
    setMenuOpen(false);
  };

  // Menu items configuration
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const closeIfOutside = (ref, setter) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setter(false);
        }
      };

      closeIfOutside(menuRef, setMenuOpen);
      closeIfOutside(profileRef, setProfileOpen);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-sm transition-all duration-300 ${darkMode
        ? 'bg-gray-900/90 border-gray-700 shadow-lg'
        : 'bg-white/95 border-gray-200 shadow-sm'
        }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Left Section - Logo and Menu */}
            <div className="flex items-center space-x-4">
              {/* Animated Logo */}
              <div
                className="flex items-center space-x-2 group cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-105 ${darkMode ? 'bg-amber-600 shadow-amber-900/50' : 'bg-amber-500 shadow-amber-400/50'
                  } shadow-lg`}>
                  <img
                    src={require('../assets/note-edit-svgrepo-com.svg').default}
                    alt="Project Logo"
                    className="h-6 w-6 filter invert transition-transform duration-300 group-hover:rotate-12"
                  />
                </div>
                <h1 className={`text-xl font-bold hidden md:block bg-gradient-to-r ${darkMode ? 'from-amber-400 to-amber-300' : 'from-amber-600 to-amber-500'
                  } bg-clip-text text-transparent tracking-tight`}>
                  Keep Your Note
                </h1>
              </div>

              {/* Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${darkMode
                    ? 'hover:bg-gray-800/80 text-gray-300'
                    : 'hover:bg-amber-100 text-gray-700'
                    } ${menuOpen ? (darkMode ? 'bg-gray-800/80' : 'bg-amber-100') : ''}`}
                  aria-expanded={menuOpen}
                >
                  <Menu className="h-5 w-5" />
                  <span className="hidden md:inline font-medium">Menu</span>
                  {menuOpen ? (
                    <ChevronUp className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  )}
                </button>

                {menuOpen && (
                  <div
                    ref={menuRef}
                    className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-xl z-50 max-h-[calc(100vh-5rem)] overflow-auto transition-all duration-200 origin-top ${darkMode
                      ? 'bg-gray-800 border border-gray-700 text-gray-300 shadow-gray-900/50'
                      : 'bg-white border border-gray-200 text-gray-700 shadow-gray-400/30'
                      }`}
                  >
                    <nav className="flex flex-col py-2">
                      {menuItems.map((item) => (
                        <button
                          key={item.id}
                          className={`flex items-center space-x-3 px-4 py-3 focus:outline-none transition-colors duration-150 ${darkMode
                            ? 'hover:bg-gray-700/50'
                            : 'hover:bg-amber-50'
                            } ${activeFilter === item.title ? (darkMode ? 'bg-gray-700 text-amber-400' : 'bg-amber-100 text-amber-600') : ''}`}
                          onClick={item.onClick}
                        >
                          <span className="flex-shrink-0">
                            {React.cloneElement(item.icon, {
                              className: `${item.icon.props.className} ${activeFilter === item.title ? (darkMode ? 'text-amber-400' : 'text-amber-600') : ''}`
                            })}
                          </span>
                          <span className="text-left font-medium">{item.title}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            </div>

            {/* Center Section - Search Bar */}
            <div className="flex-grow max-w-2xl mx-4">
              <SearchBar
                onSearch={(results) => console.log('Search results:', results)}
                darkMode={darkMode}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <button
                onClick={toggleView}
                className={`p-2 rounded-lg transition-all duration-200 ${darkMode
                  ? 'hover:bg-gray-800/80 text-gray-300'
                  : 'hover:bg-amber-100 text-gray-700'
                  } ${!isGridView ? (darkMode ? 'bg-gray-800/80' : 'bg-amber-100') : ''}`}
                aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
              >
                {isGridView ? (
                  <Grid className="h-5 w-5" />
                ) : (
                  <List className="h-5 w-5" />
                )}
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-lg transition-all duration-200 ${darkMode
                  ? 'hover:bg-gray-800/80 text-gray-300'
                  : 'hover:bg-amber-100 text-gray-700'
                  } ${isRefreshing ? (darkMode ? 'bg-gray-800/30' : 'bg-amber-100/30') : ''}`}
                aria-label="Refresh notes"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 ${darkMode
                  ? 'hover:bg-gray-800/80 text-amber-400'
                  : 'hover:bg-amber-100 text-amber-600'
                  }`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <SettingsMenu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${darkMode
                    ? 'hover:bg-gray-800/80 text-gray-300'
                    : 'hover:bg-amber-100 text-gray-700'
                    } ${profileOpen ? (darkMode ? 'bg-gray-800/80' : 'bg-amber-100') : ''}`}
                  aria-label="User profile"
                  aria-expanded={profileOpen}
                >
                  <div className={`bg-gradient-to-br rounded-full w-8 h-8 flex items-center justify-center text-white font-medium shadow-md transition-transform duration-300 hover:scale-105 ${darkMode ? 'from-amber-500 to-amber-600' : 'from-amber-400 to-amber-500'
                    }`}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div
                    ref={profileRef}
                    className={`absolute top-full right-0 mt-2 w-64 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${darkMode
                      ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50'
                      : 'bg-white border border-gray-200 shadow-gray-400/30'
                      }`}
                  >
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`bg-gradient-to-br rounded-full w-12 h-12 flex items-center justify-center text-white font-medium shadow-lg ${darkMode ? 'from-amber-500 to-amber-600' : 'from-amber-400 to-amber-500'
                          }`}>
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className={`font-semibold truncate ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {user?.name || 'User'}
                          </p>
                          <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-amber-50 text-gray-700'
                          }`}
                        onClick={() => {
                          onSignOut();
                          setProfileOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          darkMode={darkMode}
        />
      )}
    </>
  );
}

export default Header;