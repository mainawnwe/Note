import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AuthRoute from './components/auth/AuthRoute';
import Footer from './components/Footer';
import AppDownloads from './components/AppDownloads';

function CoolHeader() {
  return (
    <div className="flex items-center justify-center min-h-[64px] bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white font-bold text-xl">
      {/* Simple cool header placeholder */}
      <span>🔥 Cool Header for Auth Pages 🔥</span>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const [isGridView, setIsGridView] = useState(true);

  const toggleView = () => setIsGridView(prev => !prev);
  const onRefreshNotes = () => {
    // Implement refresh logic here or leave as no-op
    console.log('Refresh notes triggered');
    setRefreshKey(prev => prev + 1);
  };
  const onMenuClick = (item) => {
    // Implement menu click logic here or leave as no-op
    console.log('Menu item clicked:', item);
  };
  const onSignOut = () => {
    // Implement sign out logic here or leave as no-op
    console.log('Sign out triggered');
  };

  // For user, you can get from AuthContext or mock here
  const user = {
    name: 'User',
    email: 'user@example.com'
  };

  // Add refreshKey state to trigger refresh in MainContent
  const [refreshKey, setRefreshKey] = useState(0);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="flex flex-col min-h-screen">
      {isAuthPage ? (
        <CoolHeader />
      ) : (
        <Header 
          isGridView={isGridView}
          onToggleView={toggleView}
          onRefreshNotes={onRefreshNotes}
          onMenuClick={onMenuClick}
          user={user}
          onSignOut={onSignOut}
          allLabels={[]} // Pass actual labels if available
        />
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/" 
          element={
            <AuthRoute>
              <MainContent 
                key={refreshKey} 
                isGridView={isGridView} 
              />
            </AuthRoute>
          } 
        />
        <Route path="/app-downloads" element={<AppDownloads />} />
      </Routes>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
