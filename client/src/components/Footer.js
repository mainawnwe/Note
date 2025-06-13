import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-center p-6 shadow-inner">
      <p>&copy; {currentYear} React Keep App. All rights reserved.</p>
    </footer>
  );
}
