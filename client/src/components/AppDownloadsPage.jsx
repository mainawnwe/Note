import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import logo from '../assets/note-edit-svgrepo-com.svg';

const PlatformCard = ({ icon, title, description, color }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      className={`relative p-5 rounded-2xl transition-all duration-500 overflow-hidden group ${
        hovered ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gray-800/50'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-xl ${color} mr-4`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-400 mb-4">{description}</p>
        <button 
          className={`flex items-center mt-auto ${hovered ? 'text-white' : 'text-gray-400'} transition-colors`}
        >
          <Download className="w-4 h-4 mr-2" />
          <span>Download</span>
        </button>
      </div>
      
      {/* Animated background elements */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `radial-gradient(600px at ${hovered ? '40% 50%' : '50% 50%'}, ${color.replace('bg-', '')}/10, transparent 80%)`,
            transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-10" 
        />
      </div>
    </div>
  );
};

export default function AppDownloadsPage() {
  const navigate = useNavigate();
  const platforms = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.523 9.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-11.046 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM7.5 14.25v-3h9v3a3 3 0 0 1-9 0zM6 7.5h12v1.5H6v-1.5zM7.5 3a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9zM4.5 9a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15z" />
        </svg>
      ),
      title: "Android App",
      description: "Available on Play Store for all Android devices",
      color: "bg-emerald-500"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 3a3 3 0 0 1 2.995 2.824L19.5 6v12a3 3 0 0 1-2.824 2.995L16.5 21H7.5a3 3 0 0 1-2.995-2.824L4.5 18V6a3 3 0 0 1 2.824-2.995L7.5 3h9zm-4.5 3a1.5 1.5 0 0 0-1.493 1.356L10.5 7.5v9a1.5 1.5 0 0 0 2.993.144L13.5 16.5v-9a1.5 1.5 0 0 0-1.5-1.5z" />
        </svg>
      ),
      title: "iOS App",
      description: "Download on the App Store for iPhone and iPad",
      color: "bg-blue-500"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm5.657 5.657l-3.536 3.536-1.414-1.414 3.536-3.536a7.963 7.963 0 0 1 1.414 1.414zm-7.071 7.071l-3.536 3.536a7.963 7.963 0 0 1-1.414-1.414l3.536-3.536 1.414 1.414zm-1.414-7.071L6.636 6.636a7.963 7.963 0 0 1 1.414-1.414l3.536 3.536-1.414 1.414zm7.071 7.071l1.414 1.414-3.536 3.536a7.963 7.963 0 0 1-1.414-1.414l3.536-3.536z" />
        </svg>
      ),
      title: "Chrome Extension",
      description: "Add to Chrome for instant access from your browser",
      color: "bg-amber-500"
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen min-w-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Left Panel - App Preview */}
      <div className="w-full lg:w-2/5 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-pink-500/5 z-0" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${Math.random() * 10 + 3}px`,
                height: `${Math.random() * 10 + 3}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Floating Device Mockups */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
            
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-700/50 transform group-hover:-translate-y-1 transition-transform duration-500">
              <img
                src={logo}
                alt="Note App"
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>
            
            <div className="text-center mt-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Notes Anywhere
              </h2>
              <p className="text-gray-400 mt-2">
                Sync your thoughts across all devices
              </p>
            </div>
          </div>
        </div>
        
        {/* BACK BUTTON MODIFIED TO GO TO HOME PAGE */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center text-gray-300 hover:text-white transition-colors duration-300 group cursor-pointer z-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>
      
      {/* Right Panel - Download Options */}
      <div className="w-full lg:w-3/5 bg-gradient-to-b from-gray-900/80 to-gray-900 backdrop-blur-sm p-8 flex flex-col">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Get the App
          </h1>
          <p className="text-gray-400 max-w-md">
            Download Notes Anywhere on your favorite platform and sync your thoughts across all devices
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-5 flex-grow">
          {platforms.map((platform, index) => (
            <PlatformCard
              key={index}
              icon={platform.icon}
              title={platform.title}
              description={platform.description}
              color={platform.color}
            />
          ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800/50">
          <div className="flex items-center text-gray-500">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="px-4 text-sm">Also available on</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <span className="text-sm">Web App</span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <span className="text-sm">Windows</span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <span className="text-sm">MacOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 10 - 5}deg); }
          66% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 10 - 5}deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}