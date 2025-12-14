import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TaskCanvas from '../components/TaskCanvas';

export default function TaskCanvasPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Canvas</h1>
        <TaskCanvas />
      </div>
    </DashboardLayout>
  );
}