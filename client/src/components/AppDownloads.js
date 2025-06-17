import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../assets/note-edit-svgrepo-com.svg';

const AndroidIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 mr-2"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17.523 9.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-11.046 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM7.5 14.25v-3h9v3a3 3 0 0 1-9 0zM6 7.5h12v1.5H6v-1.5zM7.5 3a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9zM4.5 9a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15z" />
  </svg>
);

const IosIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 mr-2"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M16.5 3a3 3 0 0 1 2.995 2.824L19.5 6v12a3 3 0 0 1-2.824 2.995L16.5 21H7.5a3 3 0 0 1-2.995-2.824L4.5 18V6a3 3 0 0 1 2.824-2.995L7.5 3h9zm-4.5 3a1.5 1.5 0 0 0-1.493 1.356L10.5 7.5v9a1.5 1.5 0 0 0 2.993.144L13.5 16.5v-9a1.5 1.5 0 0 0-1.5-1.5z" />
  </svg>
);

const ChromeExtensionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 mr-2"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm5.657 5.657l-3.536 3.536-1.414-1.414 3.536-3.536a7.963 7.963 0 0 1 1.414 1.414zm-7.071 7.071l-3.536 3.536a7.963 7.963 0 0 1-1.414-1.414l3.536-3.536 1.414 1.414zm-1.414-7.071L6.636 6.636a7.963 7.963 0 0 1 1.414-1.414l3.536 3.536-1.414 1.414zm7.071 7.071l1.414 1.414-3.536 3.536a7.963 7.963 0 0 1-1.414-1.414l3.536-3.536z" />
  </svg>
);

export default function AppDownloads() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Modern gradient with glass morphism effect */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center backdrop-blur-sm bg-white/5 rounded-r-3xl lg:rounded-r-none lg:rounded-l-3xl shadow-2xl border border-white/10">
          <button
            onClick={() => navigate('/')}
            className="mb-8 flex items-center text-blue-200 hover:text-white transition-colors duration-300 self-start space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">App downloads</span>
          </button>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
            Capture your thoughts<br />from any device
          </h1>
          
          <ul className="space-y-6 text-lg">
            <li className="flex items-center p-4 rounded-xl hover:bg-white/10 transition-colors duration-300">
              <div className="bg-blue-600 p-2 rounded-lg mr-4">
                <AndroidIcon />
              </div>
              <span className="font-medium">Android Devices</span>
            </li>
            <li className="flex items-center p-4 rounded-xl hover:bg-white/10 transition-colors duration-300">
              <div className="bg-blue-600 p-2 rounded-lg mr-4">
                <IosIcon />
              </div>
              <span className="font-medium">iPhone & iPad</span>
            </li>
            <li className="flex items-center p-4 rounded-xl hover:bg-white/10 transition-colors duration-300">
              <div className="bg-blue-600 p-2 rounded-lg mr-4">
                <ChromeExtensionIcon />
              </div>
              <span className="font-medium">Chrome Extension</span>
            </li>
          </ul>
        </div>

        {/* Right side - Futuristic design with animated gradient */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/30 to-pink-500/20 animate-gradient-shift"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
          
          {/* Logo container with neon effect */}
          <div className="relative z-10 group">
            <div className="absolute -inset-2 bg-blue-400/30 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-12 rounded-xl shadow-2xl border border-gray-700/50 transform group-hover:scale-105 transition-transform duration-500">
              <img
                src={logo}
                alt="Note Taking App Illustration"
                className="w-64 h-64 object-contain filter drop-shadow-lg"
              />
              <div className="absolute inset-0 rounded-xl border border-blue-400/30 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-100px) translateX(20px); }
          100% { transform: translateY(0) translateX(0); }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 12s ease infinite;
        }
      `}</style>
    </div>
  );
}