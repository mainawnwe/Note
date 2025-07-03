import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainContent from './components/MainContent';
import Header from './components/Header';
import Login from './components/auth/Login';
import UserProfilePage from './components/UserProfilePage';
import { AuthContext, AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [navigationStack, setNavigationStack] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allLabels, setAllLabels] = useState([]);

  console.log('AppContent render - selectedCategory:', selectedCategory);

  const handleToggleView = (newIsGridView) => {
    console.log('handleToggleView called with:', newIsGridView);
    setIsGridView(newIsGridView);
  };

  const handleMenuClick = (filter) => {
    console.log('handleMenuClick called with:', filter);
    setSelectedCategory(filter);
  };

  const handleBack = () => {
    console.log('handleBack called');
    if (isSearchFocused) {
      // If currently on CategorizedSearch page (search dropdown open), close it and go back to main page
      setIsSearchFocused(false);
      setNavigationStack([]);
      setSelectedCategory(null);
      console.log('Closing CategorizedSearch and going back to main page');
      return;
    }
    setNavigationStack(prevStack => {
      console.log('Previous navigationStack:', prevStack);
      if (prevStack.length === 0) {
        return prevStack;
      }
      // List of all categories from CategorizedSearch.js
      const allCategories = [
        'lists', 'images', 'drawings', 'urls',
        'books', 'food', 'music', 'places', 'travel', 'tv',
        'black', 'blue', 'red', 'green', 'yellow', 'purple'
      ];
      if (selectedCategory && allCategories.includes(selectedCategory.toLowerCase())) {
        // Clear navigationStack and selectedCategory to show CategorizedSearch page
        setSelectedCategory(null);
        setIsSearchFocused(true); // Open search dropdown with CategorizedSearch
        console.log('Redirecting back to CategorizedSearch page');
        return [];
      }
      if (prevStack.length === 1) {
        // If only one item, go back to all notes (clear selection)
        setSelectedCategory(null);
        console.log('Setting selectedCategory to null');
        return [];
      }
      if (prevStack[prevStack.length - 1] === 'CATEGORY_SELECTION') {
        // If currently in category selection, go back to all notes (clear selection)
        setSelectedCategory(null);
        console.log('Setting selectedCategory to null');
        return [];
      }
      const newStack = prevStack.slice(0, -1);
      setSelectedCategory(newStack[newStack.length - 1]);
      console.log('Setting selectedCategory to', newStack[newStack.length - 1]);
      return newStack;
    });
  };

  const handleClose = () => {
    setNavigationStack([]);
    setSelectedCategory(null);
    setIsSearchFocused(false);
  };

  const handleSignOut = () => {
    console.log('User signed out');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Router>
          <Login />
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
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
            onMenuClick={handleMenuClick}
            onBack={handleBack}
            onClose={handleClose}
            navigationStack={navigationStack}
            setNavigationStack={setNavigationStack}
            user={user}
            onSignOut={handleSignOut}
            allLabels={allLabels}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
          />
          <Routes>
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/*" element={
              <MainContent
                isGridView={isGridView}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onBack={handleBack}
                onClose={handleClose}
              />
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
