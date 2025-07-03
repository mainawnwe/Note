import React, { useState } from 'react';
import {
    List, Image, Edit, Link,
    Book, Coffee, Music, MapPin,
    Airplay, Tv, ChevronDown, ChevronUp
} from 'react-feather';

const categories = {
    types: [
        { icon: <List size={20} />, label: 'Lists' },
        { icon: <Image size={20} />, label: 'Images' },
        { icon: <Edit size={20} />, label: 'Drawings' },
        { icon: <Link size={20} />, label: 'URLs' },
    ],
    things: [
        { icon: <Book size={20} />, label: 'Books' },
        { icon: <Coffee size={20} />, label: 'Food' },
        { icon: <Music size={20} />, label: 'Music' },
        { icon: <MapPin size={20} />, label: 'Places' },
        { icon: <Airplay size={20} />, label: 'Travel' },
        { icon: <Tv size={20} />, label: 'TV' },
    ],
    colors: [
        { color: '#000000', label: 'Black' },
        { color: '#2c3e50', label: 'Blue' },
        { color: '#e74c3c', label: 'Red' },
        { color: '#27ae60', label: 'Green' },
        { color: '#f39c12', label: 'Yellow' },
        { color: '#9b59b6', label: 'Purple' },
    ],
};

const CategorizedSearch = ({ navigationStack = [], onBack, onClose, onCategoryClick, darkMode }) => {
    const [showMoreThings, setShowMoreThings] = useState(false);
    const [showMoreColors, setShowMoreColors] = useState(false);

    const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
    const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
    const sectionBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
    const buttonHover = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

    const visibleThings = showMoreThings ? categories.things : categories.things.slice(0, 4);
    const visibleColors = showMoreColors ? categories.colors : categories.colors.slice(0, 4);

    const currentCategory = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;

    if (currentCategory && currentCategory !== 'CATEGORY_SELECTION') {
        // Render filtered view for the selected category with back and close buttons inside the main body area
        return (
            <div className={`p-4 rounded-xl ${bgColor} ${textColor} shadow-lg`}>
                <h2 className="text-xl font-semibold mb-2">
                    {currentCategory}
                </h2>
                <p className="text-sm opacity-70 mb-4">Showing notes filtered by this category.</p>
                <div className="flex space-x-2">
                    <div className="flex justify-between items-center w-full">
                      <button
                        type="button"
                        onClick={() => {
                          console.log('CategorizedSearch back button clicked');
                          if (onBack) onBack();
                        }}
                        className={`px-3 py-1 rounded-md border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        &larr; Back
                      </button>
                      <button
                        onClick={onClose}
                        aria-label="Close categorized search"
                        className={`px-3 py-1 rounded-md border flex items-center space-x-1 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        <span>&times;</span>
                        <span>Close</span>
                      </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render main categories view
    return (
        <div className={`p-4 rounded-xl ${bgColor} ${textColor} shadow-lg`}>
            <div className="flex justify-end mb-2">
                <button
                    onClick={onClose}
                    aria-label="Close categorized search"
                    className={`px-3 py-1 rounded-md border flex items-center space-x-1 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                    <span>&times;</span>
                    <span>Close</span>
                </button>
            </div>
            {/* Types Section */}
            <div className={`p-4 mb-4 rounded-xl ${sectionBg}`}>
                <h2 className="font-bold mb-4 text-lg flex items-center">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                        Content Types
                    </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories.types.map(({ icon, label }) => (
                        <button
                            key={label}
                            onClick={() => onCategoryClick(label)}
                            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 transform hover:scale-[1.03] ${buttonHover} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className="text-blue-500 mb-2">{icon}</div>
                            <span className="text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Things Section */}
            <div className={`p-4 mb-4 rounded-xl ${sectionBg}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">
                        <span className="bg-gradient-to-r from-green-500 to-teal-500 text-transparent bg-clip-text">
                            Categories
                        </span>
                    </h2>
                    <button
                        className={`flex items-center text-sm font-medium ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}
                        onClick={() => setShowMoreThings(!showMoreThings)}
                    >
                        {showMoreThings ? 'Show Less' : 'Show More'}
                        {showMoreThings ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {visibleThings.map(({ icon, label }) => (
                        <button
                            key={label}
                            onClick={() => onCategoryClick(label)}
                            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${buttonHover} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className="text-teal-500 mb-2">{icon}</div>
                            <span className="text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors Section */}
            <div className={`p-4 rounded-xl ${sectionBg}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
                            Colors
                        </span>
                    </h2>
                    <button
                        className={`flex items-center text-sm font-medium ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}
                        onClick={() => setShowMoreColors(!showMoreColors)}
                    >
                        {showMoreColors ? 'Show Less' : 'Show More'}
                        {showMoreColors ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                    </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {visibleColors.map(({ color, label }) => (
                        <button
                            key={label}
                            onClick={() => onCategoryClick(label)}
                            className="flex flex-col items-center group"
                            aria-label={label}
                        >
                            <div
                                className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-white transition-all duration-200 shadow-md group-hover:shadow-lg"
                                style={{ backgroundColor: color }}
                            />
                            <span className="mt-2 text-xs font-medium opacity-80 group-hover:opacity-100">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategorizedSearch;
