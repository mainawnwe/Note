import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();
  return (
    <footer className={`py-4 px-6 border-t ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-300' 
        : 'bg-white border-gray-300 text-gray-700'
    } text-center shadow-inner`}>
      <div className="container mx-auto">
        © {currentYear} React Keep App. All rights reserved.
      </div>
    </footer>
  );
}
