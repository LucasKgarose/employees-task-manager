import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { TasksCrud } from '../components';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <TasksCrud />
        </div>
      </div>
    </DashboardLayout>
  );
}
