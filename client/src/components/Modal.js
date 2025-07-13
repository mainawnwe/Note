import React from 'react';

function Modal({ isOpen, onClose, title, children, contentStyle, position = 'center', disableOverlay = false }) {
  if (!isOpen) return null;

  const justifyContent = position === 'bottom' ? 'flex-end' : 'center';

  return (
    <>
      {!disableOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      <div className={`fixed inset-0 flex items-center ${position === 'bottom' ? 'justify-end' : 'justify-center'} z-50 p-4 w-full h-full`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-full overflow-auto" style={{...contentStyle, boxSizing: 'border-box', overflowY: 'auto'}}>
          <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              &times;
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
