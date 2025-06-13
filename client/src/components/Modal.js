import React, { useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function Modal({ title, message, type = 'info', onClose }) {
  const Icon = type === 'error' ? AlertTriangle : type === 'warning' ? AlertTriangle : Info;
  const iconColor = type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-blue-500';
  const buttonColor = type === 'error' ? 'bg-red-500 hover:bg-red-600' : 
                     type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600';

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 ease-out scale-95 animate-modalEnter">
        <div className="flex items-center mb-4">
          <Icon className={`h-8 w-8 mr-3 ${iconColor}`} />
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`${buttonColor} text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
