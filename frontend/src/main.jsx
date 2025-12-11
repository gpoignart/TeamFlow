// This file might need to be renamed after "index.jsx" to ensure functionnability
// This version of the code only displays tasks and messages pages


// frontend/src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; 

// Import all testing pages
import Messages from './pages/Messages.jsx';
import Tasks from './pages/Tasks.jsx';

// =======================================================
// Temporary Root Component: Displays Tasks and Messages in vertical blocks
// =======================================================
const RootTestApp = () => {
  return (
    // Main container (block display, full width)
    <div className="w-full bg-gray-100 p-8">
      
      {/* SECTION 1: Tasks Page */}
      <div className="bg-white rounded-xl shadow-2xl p-6 mb-8">
        <Tasks /> 
      </div>

      {/* VISUAL SEPARATOR */}
      <hr className="my-8 border-t-4 border-indigo-200 rounded-full" /> 

      {/* SECTION 2: Messages Page */}
      <div className="bg-white rounded-xl shadow-2xl p-6 mt-8">
        <Messages />
      </div>

    </div>
  );
};

// Render the application to the DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootTestApp /> 
  </React.StrictMode>,
);
