import React from 'react';

export default function TopBar({ userRole, onLogout }) {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-blue-600 font-bold text-xl">Thappy Home Hospital</div>
        </div>
        <div className="flex items-center">
          <span className="mr-4">Role: {userRole}</span>
          <button 
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
