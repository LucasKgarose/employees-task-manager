import React, { useState } from "react";

export default function TasksFilter({ filters, onChange }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="flex gap-4 p-4">
        {/* Search Bar for Task Title and Assignee */}
        <input
          type="text"
          name="search"
          value={filters.search || ""}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by task title or assignee name..."
          className="rounded border px-3 py-2 text-sm flex-1 min-w-64"
        />
        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>
      
      {/* Collapsible Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 px-4 pb-4">
          {/* Priority Filter */}
          <select
            name="priority"
            value={filters.priority || ""}
            onChange={e => onChange({ ...filters, priority: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="1">1 (Lowest)</option>
            <option value="2">2</option>
            <option value="3">3 (Medium)</option>
            <option value="4">4</option>
            <option value="5">5 (Highest)</option>
          </select>
          {/* Status Filter */}
          <select
            name="status"
            value={filters.status || ""}
            onChange={e => onChange({ ...filters, status: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      )}
    </div>
  );
}
