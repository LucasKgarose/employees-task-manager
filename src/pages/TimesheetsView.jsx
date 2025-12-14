import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { canViewTasksFor } from '../utils/rolePermissions';
import { useConfirmationModal } from '../hooks/useConfirmationModal';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/Loader';

export default function TimesheetsView() {
  const { currentUser } = useUser();
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();
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
    
    // Only show current user's timesheet in this view
    return users.filter(user => user.id === currentUser.uid);
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
      const isApproved = userTasks.some(task => task.status === 'approved');

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
        isApproved,
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
        <Loader message="Loading timesheets" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Timesheets</h1>
          <p className="text-gray-600 mt-1">View and manage your timesheets</p>
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
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Week Period</th>
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
                        <p className="font-medium text-gray-900">{weekRange}</p>
                        <p className="text-xs text-gray-500">Week starting {new Date(selectedWeek).toLocaleDateString()}</p>
                      </div>
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
                        timesheet.isApproved
                          ? 'bg-purple-100 text-purple-700'
                          : timesheet.status === 'Complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {timesheet.isApproved ? 'Approved' : timesheet.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}
                        <button
                          onClick={() => {
                            window.location.href = `/timesheet?user=${timesheet.userId}&week=${selectedWeek}`;
                          }}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          title="View Timesheet"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {/* Edit - only if not approved */}
                        {!timesheet.isApproved && (
                          <button
                            onClick={() => {
                              window.location.href = `/timesheet?user=${timesheet.userId}&week=${selectedWeek}&mode=edit`;
                            }}
                            className="rounded p-1 text-gray-600 hover:bg-gray-100"
                            title="Edit Timesheet"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Delete - only if not approved */}
                        {!timesheet.isApproved && (
                          <button
                            onClick={() => {
                              showConfirmation({
                                title: 'Delete Timesheet',
                                message: 'Are you sure you want to delete this timesheet? This action cannot be undone.',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                type: 'danger',
                                onConfirm: () => {
                                  // TODO: Implement delete functionality
                                  console.log('Deleting timesheet...');
                                }
                              });
                            }}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete Timesheet"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Approved indicator */}
                        {timesheet.isApproved && (
                          <span className="text-xs text-gray-500 ml-2">Locked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {timesheetData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No timesheets found for this week
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Tasks This Week</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {timesheetData.reduce((sum, t) => sum + t.taskCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Hours Logged</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {timesheetData.reduce((sum, t) => sum + t.totalHours, 0)}h
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Status</p>
            <p className={`text-2xl font-bold mt-1 ${
              timesheetData.some(t => t.isApproved) 
                ? 'text-purple-600' 
                : timesheetData.some(t => t.status === 'Complete')
                ? 'text-green-600'
                : 'text-orange-600'
            }`}>
              {timesheetData.some(t => t.isApproved) 
                ? 'Approved' 
                : timesheetData.some(t => t.status === 'Complete')
                ? 'Complete'
                : 'In Progress'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
      />
    </DashboardLayout>
  );
}
