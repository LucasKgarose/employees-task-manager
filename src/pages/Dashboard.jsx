import React from 'react';
import { useUser } from '../context/UserContext';
import LogoutButton from '../components/LogoutButton';
import { TasksCrud } from '../components';

export default function Dashboard() {
  const { currentUser } = useUser();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {currentUser?.email}!</span>
            <LogoutButton />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <TasksCrud />
        </div>
      </div>
    </div>
  );
}
