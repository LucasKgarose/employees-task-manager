import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GridHeader({ searchValue, onSearchChange, onCreateClick }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search Bar */}
        <input
          type="text"
          value={searchValue || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by task title or assignee name..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Buttons Group */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/tasks/canvas')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 flex-1 lg:flex-initial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            <span className="hidden sm:inline">Canvas View</span>
            <span className="sm:hidden">Canvas</span>
          </button>
          <button
            onClick={onCreateClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex-1 lg:flex-initial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Create Task</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>
    </div>
  );
}