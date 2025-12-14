import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { canViewTasksFor } from '../utils/rolePermissions';
import DashboardLayout from '../components/DashboardLayout';

export default function TimesheetsView() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

      // Fetch all tasks
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on role permissions
  const visibleUsers = useMemo(() => {
    if (!currentUser) return [];
    
    return users.filter(user => {
      // Always show current user
      if (user.id === currentUser.uid) return true;
      
      // Check if current user can view this user's tasks
      return canViewTasksFor(currentUser.role, user.role || 'employee');
    });
  }, [users, currentUser]);

  // Calculate timesheet data for selected week
  const timesheetData = useMemo(() => {
    const weekStart = new Date(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return visibleUsers.map(user => {
      // Get tasks for this user in the selected week
      const userTasks = tasks.filter(task => {
        const taskAssigneeId = task.assigneeId || task.assignee?.id;
        const taskAssigneeName = task.assignee?.name || task.assignee;
        
        // Match by ID or name
        const isUserMatch = taskAssigneeId === user.id || 
                           taskAssigneeName === user.fullName ||
                           taskAssigneeName === user.email;
        
        if (!isUserMatch) return false;

        // Check if task is in the selected week
        const taskDate = new Date(task.dueDate);
        return taskDate >= weekStart && taskDate < weekEnd;
      });

      // Calculate totals
      const totalEstimateHours = userTasks.reduce((sum, task) => {
        return sum + (Number(task.estimateHours) || 0);
      }, 0);

      const totalActualHours = userTasks.reduce((sum, task) => {
        return sum + (Number(task.actualHours) || 0);
      }, 0);

      // Count lunch hours (assuming 1 per day if there are tasks)
      const uniqueDays = new Set(userTasks.map(task => task.dueDate)).size;
      const lunchHours = uniqueDays; // 1 hour per day

      const totalHours = totalActualHours + lunchHours;
      const requiredHours = 45;
      const status = totalHours >= requiredHours ? 'Complete' : 'Incomplete';

      return {
        userId: user.id,
        userName: user.fullName || user.email,
        userEmail: user.email,
        userRole: user.role || 'employee',
        taskCount: userTasks.length,
        totalEstimateHours,
        totalActualHours,
        lunchHours,
        totalHours,
        requiredHours,
        status,
        tasks: userTasks,
      };
    });
  }, [visibleUsers, tasks, selectedWeek]);

  // Calculate week date range for display
  const weekRange = useMemo(() => {
    const start = new Date(selectedWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [selectedWeek]);

  const handleWeekChange = (direction) => {
    const current = new Date(selectedWeek);
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(current.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading timesheets...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Timesheets Overview</h1>
          <p className="text-gray-600 mt-1">View and manage team timesheets</p>
        </div>

        {/* Week Selector */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleWeekChange('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">{weekRange}</h2>
              <p className="text-sm text-gray-500 mt-1">Week starting {new Date(selectedWeek).toLocaleDateString()}</p>
            </div>

            <button
              onClick={() => handleWeekChange('next')}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Timesheets Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Tasks</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Work Hours</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Lunch Hours</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Total Hours</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timesheetData.map((timesheet) => (
                  <tr key={timesheet.userId} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{timesheet.userName}</p>
                        <p className="text-xs text-gray-500">{timesheet.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {timesheet.userRole}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm text-gray-900">{timesheet.taskCount}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm text-gray-900">{timesheet.totalActualHours}h</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm text-gray-900">{timesheet.lunchHours}h</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div>
                        <span className={`text-sm font-medium ${
                          timesheet.totalHours >= timesheet.requiredHours 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {timesheet.totalHours}h
                        </span>
                        <span className="text-xs text-gray-500"> / {timesheet.requiredHours}h</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        timesheet.status === 'Complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {timesheet.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          // Navigate to user's timesheet
                          window.location.href = `/timesheet?user=${timesheet.userId}&week=${selectedWeek}`;
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {timesheetData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No timesheets found for this week
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{timesheetData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Complete Timesheets</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {timesheetData.filter(t => t.status === 'Complete').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Incomplete Timesheets</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {timesheetData.filter(t => t.status === 'Incomplete').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Hours Logged</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {timesheetData.reduce((sum, t) => sum + t.totalHours, 0)}h
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
