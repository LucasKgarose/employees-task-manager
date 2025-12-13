import React, { useState } from 'react';
import { useTimesheet, getCurrentWeekStart } from '../hooks/useTimesheet';
import { useUser } from '../context/UserContext';
import { canApproveTimesheets } from '../utils/rolePermissions';

export default function Timesheet({ employeeId, employeeName, isOwnTimesheet = true }) {
  const { currentUser } = useUser();
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const { timesheet, tasks, loading, error, submitTimesheet, approveTimesheet } = useTimesheet(employeeId, weekStart);
  const [comments, setComments] = useState(timesheet?.comments || '');
  const [lunchHours, setLunchHours] = useState(timesheet?.lunchHours || 0);
  const [submitting, setSubmitting] = useState(false);

  // TODO: Phase 2 - fetch from organization settings
  const REQUIRED_WEEKLY_HOURS = 45;
  
  const canApprove = currentUser && canApproveTimesheets(currentUser.role) && !isOwnTimesheet;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitTimesheet(lunchHours);
      alert('Timesheet submitted successfully!');
    } catch (err) {
      alert('Failed to submit timesheet: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await approveTimesheet(currentUser.uid, comments);
      alert('Timesheet approved successfully!');
    } catch (err) {
      alert('Failed to approve timesheet: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Navigate weeks
  const changeWeek = (direction) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + (direction * 7));
    setWeekStart(date.toISOString().split('T')[0]);
  };

  const getWeekEnd = (start) => {
    const date = new Date(start);
    date.setDate(date.getDate() + 6);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Loading timesheet...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-lg">Error: {error.message}</div>;
  }

  const weekEnd = getWeekEnd(weekStart);
  const totalEstimate = tasks.reduce((sum, task) => sum + (Number(task.estimateHours) || 0), 0);
  const totalActual = tasks.reduce((sum, task) => sum + (Number(task.actualHours) || 0), 0);
  const totalWeeklyHours = totalActual + (Number(lunchHours) || 0);
  const hoursShortfall = REQUIRED_WEEKLY_HOURS - totalWeeklyHours;
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'approved').length;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{employeeName}'s Timesheet</h2>
            <p className="text-blue-100 mt-1">
              Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
            </p>
            <p className="text-blue-200 text-xs mt-1">
              Showing tasks due between {weekStart} and {weekEnd}
            </p>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setWeekStart(getCurrentWeekStart())}
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm font-medium"
            >
              Current Week
            </button>
            <button
              onClick={() => changeWeek(1)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Work Hours</p>
            <p className="text-3xl font-bold mt-1">{totalActual}h</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Lunch Hours</p>
            <p className="text-3xl font-bold mt-1">{lunchHours}h</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Total Hours</p>
            <p className="text-3xl font-bold mt-1">{totalWeeklyHours}h</p>
          </div>
          <div className={`bg-white/10 rounded-lg p-4 ${
            totalWeeklyHours === REQUIRED_WEEKLY_HOURS ? 'ring-2 ring-green-300' : 
            totalWeeklyHours < REQUIRED_WEEKLY_HOURS ? 'ring-2 ring-yellow-300' : 'ring-2 ring-red-300'
          }`}>
            <p className="text-blue-100 text-sm">Required</p>
            <p className="text-3xl font-bold mt-1">{REQUIRED_WEEKLY_HOURS}h</p>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="p-6">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No tasks for this week</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Task</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Time Spent (hours)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map(task => {
                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
                          {task.notes && (
                            <p className="text-xs text-gray-500 mt-1">{task.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-lg font-semibold text-gray-900">
                        {Number(task.actualHours) || 0} hrs
                      </td>
                    </tr>
                  );
                })}
                
                {/* Lunch Hours Row */}
                <tr className="bg-blue-50 font-semibold">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-900">Lunch Break</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isOwnTimesheet && !timesheet?.approved ? (
                      <input
                        type="number"
                        value={lunchHours}
                        onChange={(e) => setLunchHours(Number(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-24 text-right rounded border border-gray-300 px-2 py-1 text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">{lunchHours || 0} hrs</span>
                    )}
                  </td>
                </tr>
                
                {/* Total Row */}
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td className="py-4 px-4 text-gray-900">TOTAL WEEKLY HOURS</td>
                  <td className="py-4 px-4 text-right text-xl text-gray-900">
                    {totalWeeklyHours} hrs
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Hours Validation Warning */}
        {!timesheet?.approved && totalWeeklyHours !== REQUIRED_WEEKLY_HOURS && (
          <div className={`mt-4 p-4 rounded-lg border ${
            totalWeeklyHours < REQUIRED_WEEKLY_HOURS 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                totalWeeklyHours < REQUIRED_WEEKLY_HOURS ? 'text-yellow-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className={`font-semibold ${
                  totalWeeklyHours < REQUIRED_WEEKLY_HOURS ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {totalWeeklyHours < REQUIRED_WEEKLY_HOURS 
                    ? `Hours Below Requirement (${hoursShortfall}h short)` 
                    : `Hours Exceed Requirement (+${Math.abs(hoursShortfall)}h over)`
                  }
                </p>
                <p className={`text-sm mt-1 ${
                  totalWeeklyHours < REQUIRED_WEEKLY_HOURS ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {totalWeeklyHours < REQUIRED_WEEKLY_HOURS
                    ? `Please ensure you log a total of ${REQUIRED_WEEKLY_HOURS} hours per week (including lunch breaks).`
                    : `Please review your hours. The weekly requirement is ${REQUIRED_WEEKLY_HOURS} hours.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {canApprove ? 'Manager Comments' : 'Notes'}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder={canApprove ? "Add comments about this timesheet..." : "Add any notes or clarifications..."}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={timesheet?.approved && !canApprove}
          />
        </div>

        {/* Approval Status */}
        {timesheet?.approved && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-green-700">Timesheet Approved</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Approved on {formatDate(timesheet.approvedAt)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!timesheet?.approved && (
          <div className="flex justify-end gap-3 mt-6">
            {isOwnTimesheet && (
              <button
                onClick={handleSubmit}
                disabled={submitting || tasks.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Submitting...' : 'Submit Timesheet'}
              </button>
            )}
            
            {canApprove && timesheet && (
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Approving...' : 'Approve Timesheet'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
