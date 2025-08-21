import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FileText, Github, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`py-6 px-6 border-t backdrop-blur-sm transition-all duration-300 ${darkMode
        ? 'bg-gradient-to-r from-gray-900/90 to-gray-800/90 border-gray-700 text-gray-300'
        : 'bg-gradient-to-r from-teal-50/90 via-cyan-50/90 to-blue-50/90 border-gray-200 text-gray-700'
      }`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Section - Logo and Copyright */}
          <div className="flex items-center mb-4 md:mb-0">
            <div className={`p-2 rounded-lg mr-3 ${darkMode
                ? 'bg-gradient-to-br from-teal-600 to-cyan-700'
                : 'bg-gradient-to-br from-teal-500 to-cyan-600'
              }`}>
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className={`font-bold text-lg ${darkMode ? 'text-teal-400' : 'text-teal-600'
                }`}>
                Keep Note
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                © {currentYear} All rights reserved.
              </div>
            </div>
          </div>

          {/* Center Section - Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <a
              href="#"
              className={`flex items-center text-sm transition-colors duration-300 hover:text-teal-500 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
            >
              <Github className="h-4 w-4 mr-1" />
              GitHub
            </a>
            <a
              href="#"
              className={`flex items-center text-sm transition-colors duration-300 hover:text-teal-500 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
            >
              <Mail className="h-4 w-4 mr-1" />
              Contact
            </a>
            <a
              href="#"
              className={`text-sm transition-colors duration-300 hover:text-teal-500 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className={`text-sm transition-colors duration-300 hover:text-teal-500 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
            >
              Terms of Service
            </a>
          </div>

          {/* Right Section - Made with Love */}
          <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Made with
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            by Keep Note Team
          </div>
        </div>

        {/* Bottom Divider */}
        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
          <div className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
            v1.0.0 | Designed with modern web technologies
          </div>
        </div>
      </div>
    </footer>
  );
}