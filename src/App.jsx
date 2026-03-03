// src/App.jsx
import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import AccessGate from './components/AccessGate';

const App = () => {
  return (
    <AccessGate>
      <div className="App">
        <AppRoutes />
        {/* GLOBAL TOASTER */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </AccessGate>
  );
};

export default App;
