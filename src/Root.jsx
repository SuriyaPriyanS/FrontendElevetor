// src/Root.jsx
import React from 'react';
import { FirebaseProvider } from './contexts/FirebaseContext';
import App from './App';

function Root() {
  return (
    <FirebaseProvider>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateX(20px); }
          10% { opacity: 1; transform: translateX(0); }
          90% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse-red {
          0%, 100% { color: #EF4444; opacity: 1; }
          50% { color: #FECACA; opacity: 0.7; }
        }
        @keyframes pulse-blue {
          0%, 100% { color: #3B82F6; opacity: 1; }
          50% { color: #BFDBFE; opacity: 0.7; }
        }
        @keyframes pulse-green {
          0%, 100% { color: #10B981; opacity: 1; }
          50% { color: #D1FAE5; opacity: 0.7; }
        }
        @keyframes bounce-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes bounce-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
        .animate-fade-in-out { animation: fade-in-out 5s ease-out forwards; }
        .animate-pulse { animation: pulse 1.5s infinite; }
        .animate-pulse-red { animation: pulse-red 1.5s infinite; }
        .animate-pulse-blue { animation: pulse-blue 1.5s infinite; }
        .animate-pulse-green { animation: pulse-green 1.5s infinite; }
        .animate-bounce-up { animation: bounce-up 1s infinite; }
        .animate-bounce-down { animation: bounce-down 1s infinite; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <App />
    </FirebaseProvider>
  );
}

export default Root;