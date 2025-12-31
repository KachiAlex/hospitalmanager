import React from 'react';
import TopBar from './TopBar';
import SideMenu from './SideMenu';
import DoctorDashboard from './DoctorDashboard';
import NurseDashboard from './NurseDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import AdminDashboard from './AdminDashboard';

export default function HomePage({ userRole, onLogout }) {
  return (
    <div className="font-sans flex flex-col min-h-screen">
      <TopBar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex flex-1">
        <SideMenu userRole={userRole} />
        
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          
          {/* Role-specific dashboard content */}
          {userRole === 'doctor' && <DoctorDashboard />}
          
          {userRole === 'nurse' && <NurseDashboard />}
          
          {userRole === 'receptionist' && <ReceptionistDashboard />}
          
          {userRole === 'admin' && <AdminDashboard />}
        </main>
      </div>
    </div>
  );
}
