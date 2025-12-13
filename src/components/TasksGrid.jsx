import React from 'react';
import { useTasksGrid } from '../hooks/useTasksGrid';

export default function TasksGrid({ filter }) {
  const { tasks, loading, error } = useTasksGrid(filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-6 shadow">
        <span className="text-sm text-gray-500">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 shadow">
        Error loading tasks: {error.message}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
      </div>

      {/* Table wrapper for horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              {[
                'Title',
                'Description',
                'Due Date',
                'Status',
                'Assignee',
                'Reviewer',
                'Estimate (hrs)',
                'Actual (hrs)',
                'Notes',
              ].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {tasks.map((task, index) => (
              <tr
                key={task.id}
                className={`transition hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {task.title}
                </td>

                <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                  {task.description}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.dueDate}
                </td>

                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : task.status === 'approved'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {task.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.assignee?.name || task.assignee}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.reviewer?.name || task.reviewer || '—'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.estimateHours}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.actualHours ?? '—'}
                </td>

                <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                  {task.notes || '—'}
                </td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
