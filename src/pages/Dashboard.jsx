import React from 'react';
import { useUser } from '../context/UserContext';
import { TasksCrud } from '../components';

export default function Dashboard() {
  const { currentUser } = useUser();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg">Welcome, {currentUser?.email}!</p>
          <TasksCrud />
        </div>
      </div>
    </div>
  );
}
