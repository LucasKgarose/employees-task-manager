import React, { useState } from 'react';
import { useFirebaseTasks } from '../hooks/useFirebaseTasks';

export default function WeeklyTaskForm({ employeeId, employeeName, weekStart, weekEnd, onSuccess, onClose }) {
  const { addTask } = useFirebaseTasks();
  const [tasks, setTasks] = useState([
    { title: '', actualHours: '', notes: '' }
  ]);
  const [lunchHours, setLunchHours] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addTaskRow = () => {
    setTasks([...tasks, { title: '', actualHours: '', notes: '' }]);
  };

  const removeTaskRow = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const validTasks = tasks.filter(t => t.title.trim() && t.actualHours > 0);
      
      if (validTasks.length === 0) {
        setError('Please add at least one task with title and hours');
        setSubmitting(false);
        return;
      }

      const now = new Date().toISOString();
      
      // Create all tasks
      for (const task of validTasks) {
        await addTask({
          title: task.title.trim(),
          description: '',
          dueDate: weekEnd, // Set due date to end of week
          status: 'completed',
          assignee: employeeId,
          reviewer: '',
          priority: 3,
          estimateHours: Number(task.actualHours) || 0,
          actualHours: Number(task.actualHours) || 0,
          notes: task.notes || '',
          createdAt: now,
          updatedAt: now,
        });
      }

      onSuccess?.(lunchHours);
      onClose();
    } catch (err) {
      console.error('Error creating tasks:', err);
      setError(err.message || 'Failed to create tasks');
    } finally {
      setSubmitting(false);
    }
  };

  const totalHours = tasks.reduce((sum, task) => sum + (Number(task.actualHours) || 0), 0);
  const totalWithLunch = totalHours + (Number(lunchHours) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add Weekly Tasks</h2>
              <p className="text-sm text-gray-600 mt-1">
                {employeeName} - Week of {weekStart} to {weekEnd}
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tasks Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tasks Completed This Week</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-1/2">Task Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-32">Hours</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Notes (optional)</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTask(index, 'title', e.target.value)}
                          placeholder="e.g., Client meeting, Draft contract..."
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={task.actualHours}
                          onChange={(e) => updateTask(index, 'actualHours', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.5"
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={task.notes}
                          onChange={(e) => updateTask(index, 'notes', e.target.value)}
                          placeholder="Any clarifications..."
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTaskRow(index)}
                            className="text-red-600 hover:text-red-700"
                            title="Remove task"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Task Button */}
            <button
              type="button"
              onClick={addTaskRow}
              className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Another Task
            </button>
          </div>

          {/* Lunch Hours */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Lunch Hours (Total for the Week)
            </label>
            <input
              type="number"
              value={lunchHours}
              onChange={(e) => setLunchHours(Number(e.target.value) || 0)}
              min="0"
              step="0.5"
              className="w-48 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Work Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lunch Hours</p>
                <p className="text-2xl font-bold text-gray-900">{lunchHours}h</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalWithLunch}h</p>
              </div>
            </div>
            {totalWithLunch !== 45 && (
              <p className={`text-sm mt-2 ${totalWithLunch < 45 ? 'text-yellow-700' : 'text-red-700'}`}>
                {totalWithLunch < 45 
                  ? `⚠️ ${45 - totalWithLunch}h short of the 45-hour requirement`
                  : `⚠️ ${totalWithLunch - 45}h over the 45-hour requirement`
                }
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Tasks...' : 'Create Tasks & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
