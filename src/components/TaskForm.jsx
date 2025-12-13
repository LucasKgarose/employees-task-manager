import React from 'react';
import { useTaskForm } from '../hooks/useTaskForm';

export default function TaskForm({ initialTask, onSuccess }) {
  const {
    form,
    handleChange,
    handleSubmit,
    submitting,
    error
  } = useTaskForm(initialTask);

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        {initialTask ? 'Edit Task' : 'Create Task'}
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the task..."
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dates & Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* People */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assignee
          </label>
          <input
            name="assignee"
            value={form.assignee}
            onChange={handleChange}
            placeholder="User ID"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reviewer
          </label>
          <input
            name="reviewer"
            value={form.reviewer}
            onChange={handleChange}
            placeholder="User ID (optional)"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Hours */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estimated Hours
          </label>
          <input
            name="estimateHours"
            type="number"
            value={form.estimateHours}
            onChange={handleChange}
            placeholder="e.g. 4"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Actual Hours
          </label>
          <input
            name="actualHours"
            type="number"
            value={form.actualHours}
            onChange={handleChange}
            placeholder="e.g. 5"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Optional notes..."
          rows={2}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
        //   disabled={submitting}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Task'}
        </button>
      </div>
    </form>
  );
}
