import React, { useState } from 'react';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleLogin = (token, role) => {
    // Store token in localStorage or context
    localStorage.setItem('authToken', token);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserRole('');
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <HomePage onLogout={handleLogout} userRole={userRole} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
