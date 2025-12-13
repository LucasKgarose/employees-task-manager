import React, { useState } from "react";

export default function TasksFilter({ filters, onChange }) {
  const [showFilters, setShowFilters] = useState(false);

  const priorities = [
    { value: "1", label: "1 - Lowest" },
    { value: "2", label: "2 - Low" },
    { value: "3", label: "3 - Medium" },
    { value: "4", label: "4 - High" },
    { value: "5", label: "5 - Highest" }
  ];

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "approved", label: "Approved" }
  ];

  const handlePriorityChange = (value) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(value)
      ? currentPriorities.filter(p => p !== value)
      : [...currentPriorities, value];
    onChange({ ...filters, priority: newPriorities });
  };

  const handleStatusChange = (value) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(value)
      ? currentStatuses.filter(s => s !== value)
      : [...currentStatuses, value];
    onChange({ ...filters, status: newStatuses });
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="flex gap-4 p-4">
        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {((filters.priority && filters.priority.length > 0) || (filters.status && filters.status.length > 0)) && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {(filters.priority?.length || 0) + (filters.status?.length || 0)}
            </span>
          )}
        </button>
      </div>
      
      {/* Collapsible Filters */}
      {showFilters && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Filter Cards */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Priority</h3>
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority) => (
                  <label
                    key={priority.value}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition ${
                      (filters.priority || []).includes(priority.value)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(filters.priority || []).includes(priority.value)}
                      onChange={() => handlePriorityChange(priority.value)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{priority.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter Cards */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <label
                    key={status.value}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition ${
                      (filters.status || []).includes(status.value)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(filters.status || []).includes(status.value)}
                      onChange={() => handleStatusChange(status.value)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {((filters.priority && filters.priority.length > 0) || (filters.status && filters.status.length > 0)) && (
            <div className="pt-3">
              <button
                onClick={() => onChange({ priority: [], status: [] })}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
