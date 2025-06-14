import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';

function App() {
  const [isGridView, setIsGridView] = useState(true);

  const handleToggleView = (newIsGridView) => {
    setIsGridView(newIsGridView);
  };

  const handleMenuClick = (menuItem) => {
    console.log('Menu item clicked:', menuItem);
    // Add further handling logic here as needed
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isGridView={isGridView} onToggleView={handleToggleView} onMenuClick={handleMenuClick} />
      <MainContent isGridView={isGridView} />
      <Footer />
    </div>
  );
}

export default App;
