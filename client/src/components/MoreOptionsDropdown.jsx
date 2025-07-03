import React, { forwardRef } from 'react';
import { Clock, User, ChevronDown, MoreHorizontal } from 'lucide-react';

const MoreOptionsDropdown = forwardRef(({ isOpen, onToggle, darkMode }, ref) => {
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className={
          "p-2 rounded-lg flex items-center " +
          (isOpen
            ? "bg-blue-500/10 text-blue-500"
            : darkMode
              ? "text-gray-400 hover:bg-gray-700"
              : "text-gray-500 hover:bg-gray-200/50"
          )
        }
      >
        <MoreHorizontal className="h-5 w-5" />
        <ChevronDown className={"h-4 w-4 ml-1 transition-transform " + (isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className={
          "absolute bottom-full mb-2 left-0 w-56 rounded-lg shadow-lg z-50 " +
          (darkMode 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-200"
          )
        }>
          <button
            type="button"
            className="w-full text-left px-4 py-2 flex items-center hover:bg-gray-100"
          >
            <Clock className="mr-3 h-5 w-5 text-gray-500" />
            <span>Reminder</span>
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 flex items-center hover:bg-gray-100"
          >
            <User className="mr-3 h-5 w-5 text-gray-500" />
            <span>Collaborator</span>
          </button>
        </div>
      )}
    </div>
  );
});

export default MoreOptionsDropdown;
