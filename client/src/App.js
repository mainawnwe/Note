import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainContent from './components/MainContent';
import Header from './components/Header';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import UserProfilePage from './components/UserProfilePage';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import AppDownloadsPage from './components/AppDownloadsPage';
import EditLabelsModal from './components/EditLabelsModal';
import CreateArea from './components/CreateArea';

function AppContent() {
  const { user, loading, logout } = useContext(AuthContext);
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [navigationStack, setNavigationStack] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentLabel, setCurrentLabel] = useState(null);
  const [allLabels, setAllLabels] = useState([]);
  const [isEditLabelsOpen, setIsEditLabelsOpen] = useState(false);

  const [notesLoading, setNotesLoading] = useState(false);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await fetch('http://localhost:8000/labels.php');
        if (!response.ok) {
          console.error('Labels fetch failed with status:', response.status);
          throw new Error('Failed to fetch labels');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error('Labels fetch returned invalid data:', data);
          throw new Error('Invalid labels data');
        }
        setAllLabels(data);
      } catch (err) {
        console.error('Error fetching labels:', err);
        setAllLabels([]); // Clear labels on error
      }
    };
    fetchLabels();
  }, []);

  const fetchNotes = async (showLoading = true) => {
    if (showLoading) {
      setNotesLoading(true);
    }
    try {
      let url = 'http://localhost:8000/index.php';
      const statusCategories = ['trash', 'archive'];
      const noteTypeMap = {
        'lists': 'list',
        'images': 'image',
        'drawings': 'drawing',
        'urls': 'url'
      };
      if (selectedType || selectedLabel || selectedCategory) {
        const params = new URLSearchParams();

        if (selectedCategory) {
          const lowerCat = selectedCategory.toLowerCase();
          if (statusCategories.includes(lowerCat)) {
            params.append('status', lowerCat === 'trash' ? 'trashed' : 'archived');
          }
        }

        if (selectedType) {
          params.append('type', selectedType);
        }

        if (selectedLabel) {
          params.append('label', selectedLabel);
        }

        const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      console.log('Fetching notes with URL:', url);
    }
    const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      const data = await response.json();
      const formattedNotes = data.map(note => ({
        ...note,
        id: note.id.toString(),
        pinned: note.pinned === 1 || note.pinned === true || note.pinned === '1'
      }));
      const activeNotes = formattedNotes.filter(note => note.status !== 'trashed');
      activeNotes.sort((a, b) => {
        if (a.pinned === b.pinned) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.pinned - a.pinned;
      });
      setNotes(activeNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      if (showLoading) {
        setNotesLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch on mount only
    fetchNotes();
  }, []);

  const handleToggleView = (newIsGridView) => {
    setIsGridView(newIsGridView);
  };

  const handleMenuClick = (filter) => {
    if (filter === 'Edit Labels') {
      setIsEditLabelsOpen(true);
      return;
    }
    setSelectedType(null);
    setSelectedLabel(null);
    setSelectedCategory(filter);
    // Removed fetchNotes(false) here to avoid stale selectedCategory
  };

  const handleCategoryClick = (category) => {
    const typeMap = {
      'Lists': 'list',
      'Images': 'image',
      'Drawings': 'drawing',
      'URLs': 'url'
    };
    if (typeMap[category]) {
      setSelectedType(typeMap[category]);
      setSelectedLabel(null);
      setSelectedCategory(null);
    } else {
      setSelectedLabel(category);
      setSelectedType(null);
      setSelectedCategory(null);
    }
  };

  useEffect(() => {
    // Initial fetch on mount only
    fetchNotes();
  }, []);

  useEffect(() => {
    // Fetch notes without loading spinner when selectedCategory changes
    if (selectedCategory !== null) {
      fetchNotes(false);
    }
  }, [selectedCategory]);

  const handleBack = () => {
    if (isSearchFocused) {
      setIsSearchFocused(false);
      setNavigationStack([]);
      setSelectedCategory(null);
      setCurrentLabel(null);
      return;
    }
    if (currentLabel) {
      setCurrentLabel(null);
      setSelectedCategory(null);
      setNavigationStack([]);
      return;
    }
    if (selectedCategory && allLabels.some(label => label.name === selectedCategory)) {
      // If on a label page, going back should clear selectedCategory and currentLabel
      setSelectedCategory(null);
      setCurrentLabel(null);
      setNavigationStack([]);
      return;
    }
    setNavigationStack(prevStack => {
      if (prevStack.length === 0) {
        return prevStack;
      }
      if (prevStack.length === 1) {
        setSelectedCategory(null);
        setCurrentLabel(null);
        return [];
      }
      if (prevStack[prevStack.length - 1] === 'CATEGORY_SELECTION') {
        setSelectedCategory(null);
        setCurrentLabel(null);
        return [];
      }
      const newStack = prevStack.slice(0, -1);
      setSelectedCategory(newStack[newStack.length - 1]);
      setCurrentLabel(null);
      return newStack;
    });
  };

  const handleClose = () => {
    setNavigationStack([]);
    setSelectedCategory(null);
    setCurrentLabel(null);
    setIsSearchFocused(false);
  };

  const handleSignOut = () => {
    logout();
  };

  const handleLabelClick = (label) => {
    setSelectedLabel(label);
    setSelectedType(null);
    setSelectedCategory(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <ThemeProvider>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={<Login />} />
          </Routes>
      </ThemeProvider>
    );
  }

  const handleRefreshNotes = async () => {
    await fetchNotes();
  };

  return (
    <ThemeProvider>
        <div className="min-h-screen p-8 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
          <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; }
            `}
          </style>
          <Header
            isGridView={isGridView}
            onToggleView={handleToggleView}
            onRefreshNotes={handleRefreshNotes}
            onMenuClick={handleMenuClick}
            onBack={handleBack}
            onClose={handleClose}
            navigationStack={navigationStack}
            setNavigationStack={setNavigationStack}
            user={user}
            onSignOut={handleSignOut}
            allLabels={allLabels}
            setAllLabels={setAllLabels}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            onLabelClick={handleLabelClick}
            notesLoading={notesLoading}
          />
          <Routes>
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/*" element={
              <MainContent
                isGridView={isGridView}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                currentLabel={currentLabel}
                onBack={handleBack}
                onClose={handleClose}
                allLabels={allLabels}
                setAllLabels={setAllLabels}
                notesLoading={notesLoading}
                onRefreshNotes={handleRefreshNotes}
                notes={notes}
                setNotes={setNotes}
              />
            } />
          </Routes>
          <EditLabelsModal
            isOpen={isEditLabelsOpen}
            onClose={() => setIsEditLabelsOpen(false)}
            labels={allLabels}
            setLabels={setAllLabels}
            darkMode={false}
          />
        </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
          <Router>
            <Routes>
              <Route path="/app-downloads" element={<AppDownloadsPage />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
