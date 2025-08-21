import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, Tag, Edit3, Archive, Trash2,
  Menu, ChevronUp, ChevronDown, Grid, List,
  RefreshCw, Sun, Moon, Settings, HelpCircle, LogOut
} from 'react-feather';
import SearchBar from './Search';
import CategorizedSearch from './CategorizedSearch';
import DetailedSettingsPanel from './DetailedSettingsPanel';
import FeedbackModal from './FeedbackModal';
import SettingsMenu from './SettingsMenu';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EditLabelsModal from './EditLabelsModal';

function Header({
  isGridView,
  onToggleView = () => { },
  onRefreshNotes = () => { },
  onMenuClick = () => { },
  onBack = () => { },
  onClose = () => { },
  navigationStack,
  setNavigationStack,
  user = {},
  onSignOut = () => { },
  allLabels = [],
  setAllLabels = () => { },
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused,
  notesLoading,
  onToggleSidebar = () => { }
}) {
  console.log('Header user prop:', user);
  const { darkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Notes');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isEditLabelsOpen, setIsEditLabelsOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const searchBarRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Log profile picture URL when user or profile_picture changes
  useEffect(() => {
    if (user?.profile_picture) {
      console.log('Profile picture URL:', `http://localhost:8000/api/uploads/${user.profile_picture.replace(/^\/uploads\//, '')}`);
    }
  }, [user?.profile_picture]);

  // Toggle functions
  const toggleView = () => {
    onToggleView(!isGridView);
  };
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const handleRefresh = async () => {
    setMenuOpen(false);
    setProfileOpen(false);
    try {
      await onRefreshNotes();
    } finally {
      // no local isRefreshing state anymore
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveFilter(item);
    // Treat "Notes" as clearing the filter
    if (item === 'Notes') {
      onMenuClick(null);
      navigate('/');
    } else if (item === 'Edit Labels') {
      setIsEditLabelsOpen(true);
    } else if (item === 'archive') {
      navigate('/archive');
    } else if (item === 'trash') {
      navigate('/trash');
    } else if (allLabels.some(label => label.name === item)) {
      onMenuClick(item);
      navigate(`/label/${encodeURIComponent(item)}`);
    } else {
      onMenuClick(item);
    }
    setMenuOpen(false);
  };

  const handleCategoryClick = (category) => {
    setNavigationStack(prevStack => {
      // If the last item is CATEGORY_SELECTION, replace it with the new category
      let newStack;
      if (prevStack.length === 1 && prevStack[0] === 'CATEGORY_SELECTION') {
        newStack = [category];
      } else {
        newStack = [...prevStack, category];
      }
      return newStack;
    });
    onMenuClick(category);
    setIsSearchFocused(false);
  };

  // New effect to hide CategorizedSearch dropdown when typing in search bar
  React.useEffect(() => {
    if (searchTerm && searchTerm.trim() !== '') {
      setIsSearchFocused(false);
    }
  }, [searchTerm, setIsSearchFocused]);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setNavigationStack(['CATEGORY_SELECTION']);
  };

  const selectedCategory = (navigationStack && navigationStack.length > 0) ? navigationStack[navigationStack.length - 1] : null;

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
      id: `label-${label.id}`,
      title: label.name,
      icon: <Tag className="h-5 w-5" />,
      onClick: () => handleMenuItemClick(label.name)
    })),
    {
      id: 'edit-labels',
      title: "Edit Labels",
      icon: <Edit3 className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('Edit Labels')
    },
    {
      id: 'archive',
      title: "archive",
      icon: <Archive className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('archive')
    },
    {
      id: 'trash',
      title: "trash",
      icon: <Trash2 className="h-5 w-5" />,
      onClick: () => handleMenuItemClick('trash')
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
      // Close search dropdown if click outside search bar and dropdown
      if (searchBarRef.current && !searchBarRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-sm transition-all duration-300 ${darkMode
          ? 'bg-gradient-to-r from-gray-900/90 to-gray-800/90 border-gray-700 shadow-lg'
          : 'bg-gradient-to-r from-teal-50/95 via-cyan-50/95 to-blue-50/95 border-gray-200 shadow-sm'
        }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Main Menu Button and Logo */}
            <div className="flex items-center space-x-4 relative">
              {/* Animated Logo */}
              <div
                className="flex items-center space-x-2 group cursor-pointer z-20"
                onClick={() => navigate('/')}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-lg ${darkMode
                    ? 'bg-gradient-to-br from-teal-600 to-cyan-700 shadow-teal-900/50'
                    : 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-teal-400/50'
                  }`}>
                  <img
                    src={require('../assets/note-edit-svgrepo-com.svg').default}
                    alt="Project Logo"
                    className={`h-6 w-6 transition-transform duration-300 group-hover:rotate-12 ${darkMode ? 'filter invert' : ''
                      }`}
                  />
                </div>
                <h1 className={`text-xl font-bold hidden md:block bg-gradient-to-r ${darkMode
                    ? 'from-teal-400 to-cyan-300'
                    : 'from-teal-600 to-cyan-500'
                  } bg-clip-text text-transparent tracking-tight`}>
                  Keep Note
                </h1>
              </div>
            </div>

            {/* Center Section - Search Bar */}
            <div className="flex-grow max-w-2xl mx-4 relative">
              <SearchBar
                onSearch={(results) => console.log('Search results:', results)}
                darkMode={darkMode}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onFocus={(e) => {
                  handleSearchFocus();
                  setIsSearchFocused(true);
                }}
                setIsSearchFocused={setIsSearchFocused}
                onBlur={(e) => {
                  // Delay hiding to allow click on dropdown
                  setTimeout(() => {
                    // Check if the new focused element is inside the dropdown
                    if (e.currentTarget && document.activeElement && !e.currentTarget.contains(document.activeElement)) {
                      setIsSearchFocused(false);
                    }
                  }, 150);
                }}
              />
              {isSearchFocused && (
                <div
                  className="absolute top-full left-0 w-full z-50 mt-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden"
                  onMouseDown={(e) => {
                    // Prevent blur when clicking inside dropdown
                    e.preventDefault();
                  }}
                >
                  <CategorizedSearch
                    navigationStack={navigationStack}
                    onBack={onBack}
                    onClose={() => setIsSearchFocused(false)}
                    onCategoryClick={handleCategoryClick}
                    darkMode={darkMode}
                  />
                </div>
              )}
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <button
                onClick={() => {
                  toggleView();
                }}
                className={`p-2 rounded-xl transition-all duration-200 ${darkMode
                    ? 'hover:bg-gray-800/80 text-gray-300'
                    : 'hover:bg-teal-100 text-gray-700'
                  } ${!isGridView ? (darkMode ? 'bg-gray-800/80' : 'bg-teal-100') : ''}`}
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
                onClick={() => {
                  handleRefresh();
                }}
                disabled={notesLoading}
                className={`p-2 rounded-xl transition-all duration-200 ${darkMode
                    ? 'hover:bg-gray-800/80 text-gray-300'
                    : 'hover:bg-teal-100 text-gray-700'
                  } ${notesLoading ? (darkMode ? 'bg-gray-800/30' : 'bg-teal-100/30') : ''}`}
                aria-label="Refresh notes"
              >
                <RefreshCw className={`h-5 w-5 ${notesLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-all duration-200 ${darkMode
                    ? 'hover:bg-gray-800/80 text-teal-400'
                    : 'hover:bg-teal-100 text-teal-600'
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
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${darkMode
                      ? 'hover:bg-gray-800/80 text-gray-300'
                      : 'hover:bg-teal-100 text-gray-700'
                    } ${profileOpen ? (darkMode ? 'bg-gray-800/80' : 'bg-teal-100') : ''}`}
                  aria-label="User profile"
                  aria-expanded={profileOpen}
                >
                  {user?.profile_picture ? (
                    <img
                      src={`http://localhost:8000/uploads/${user.profile_picture.replace(/^\/?uploads\//, '')}`}
                      alt="Profile"
                      className="rounded-full shadow-md transition-transform duration-300 hover:scale-105"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className={`bg-gradient-to-br rounded-full w-8 h-8 flex items-center justify-center text-white font-medium shadow-md transition-transform duration-300 hover:scale-105 ${darkMode ? 'from-teal-500 to-cyan-600' : 'from-teal-400 to-cyan-500'
                      }`}>
                      {(user?.username || user?.name)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div
                    ref={profileRef}
                    className={`absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${darkMode
                        ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50'
                        : 'bg-white border border-gray-200 shadow-gray-400/30'
                      }`}
                  >
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                      <div className="flex items-center space-x-3">
                        {user?.profile_picture ? (
                          <>
                            <img
                              src={`http://localhost:8000/uploads/${user.profile_picture.replace(/^\/?uploads\//, '')}`}
                              alt="Profile"
                              className="rounded-full border-4 border-teal-500 shadow-lg"
                              style={{ width: '48px', height: '48px', objectFit: 'cover', padding: '2px' }}
                            />
                          </>
                        ) : (
                          <div className={`bg-gradient-to-br rounded-full w-12 h-12 flex items-center justify-center text-white font-medium shadow-lg ${darkMode ? 'from-teal-500 to-cyan-600' : 'from-teal-400 to-cyan-500'
                            }`}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className={`font-semibold truncate ${darkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                            {user?.username || user?.name || 'User'}
                          </p>
                          <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-teal-50 text-gray-700'
                          }`}
                        onClick={() => {
                          navigate('/profile');
                          setProfileOpen(false);
                        }}
                      >
                        <Edit3 className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">Profile</span>
                      </button>
                      <button
                        className={`flex items-center w-full px-4 py-3 transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-teal-50 text-gray-700'
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

      <EditLabelsModal
        isOpen={isEditLabelsOpen}
        onClose={() => setIsEditLabelsOpen(false)}
        labels={allLabels}
        setLabels={setAllLabels}
        onLabelsChange={setAllLabels}
        darkMode={darkMode}
      />
    </>
  );
}

export default Header;