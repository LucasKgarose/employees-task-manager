import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Timesheet from '../components/Timesheet';

export default function TimesheetPage() {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  if (!currentUser) {
    return <div>Please log in to view timesheets</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Timesheet Component */}
      <Timesheet 
        employeeId={currentUser.email}
        employeeName={currentUser.displayName || currentUser.email}
        isOwnTimesheet={true}
      />
    </div>
  );
}
