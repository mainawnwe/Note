import React, { useState } from 'react';

const Search = ({ onSearch, searchTerm, setSearchTerm, onFocus, onBlur, darkMode }) => {
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term.');
      return;
    }
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/search.php?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const results = await response.json();
      onSearch(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again later.');
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search notes..."
        className={`p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
      />
      <button
        onClick={handleSearch}
        className="ml-2 p-2 bg-blue-500 text-white rounded"
      >
        Search
      </button>
      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </div>
  );
};

export default Search;
