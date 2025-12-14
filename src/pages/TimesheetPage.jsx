import React from 'react';
import { useUser } from '../context/UserContext';
import Timesheet from '../components/Timesheet';
import DashboardLayout from '../components/DashboardLayout';

export default function TimesheetPage() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <div>Please log in to view timesheets</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Timesheet Component */}
        <Timesheet 
          employeeId={currentUser.email}
          employeeName={currentUser.displayName || currentUser.email}
          isOwnTimesheet={true}
        />
      </div>
    </DashboardLayout>
  );
}
