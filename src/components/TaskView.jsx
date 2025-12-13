import React, { useState } from "react";
import TaskEditForm from "./TaskEditForm";

export default function TaskView({ task, isOpen, onClose }) {
  const [isEditMode, setIsEditMode] = useState(false);

  if (!isOpen || !task) return null;

  // Close edit form and task view
  const handleEditSuccess = () => {
    setIsEditMode(false);
    onClose();
  };

  // If in edit mode, show edit form instead
  if (isEditMode) {
    return (
      <TaskEditForm 
        task={task} 
        isOpen={true} 
        onClose={() => setIsEditMode(false)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  const getStatusColor = () => {
    if (task.status === "completed" || task.status === "approved") {
      return "bg-green-100 text-green-700";
    }
    if (task.status === "pending") {
      return "bg-red-100 text-red-700";
    }
    return "bg-yellow-100 text-yellow-700";
  };

  const getPriorityColor = () => {
    const priority = task.priority || 3;
    if (priority <= 2) return "bg-green-500";
    if (priority === 3) return "bg-yellow-500";
    if (priority === 4) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-2xl w-full mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium mt-2 ${getStatusColor()}`}>
                {task.status}
              </span>
            </div>
            <div className="flex items-center gap-1 ml-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-4 w-2 rounded-sm ${
                    level <= (task.priority || 3) ? getPriorityColor() : "bg-gray-200"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">Priority {task.priority || 3}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <p className="text-gray-600 bg-gray-50 p-3 rounded border">
              {task.description || 'No description provided'}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <p className="text-gray-600">{task.dueDate || 'Not set'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <p className="text-gray-600">{task.assignee?.name || task.assignee || 'Unassigned'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer</label>
                <p className="text-gray-600">{task.reviewer?.name || task.reviewer || 'Not assigned'}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                <p className="text-gray-600">{task.estimateHours ? `${task.estimateHours} hours` : 'Not set'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
                <p className="text-gray-600">{task.actualHours ? `${task.actualHours} hours` : 'Not tracked'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p className="text-gray-600">{task.createdBy?.name || task.createdBy || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {task.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <p className="text-gray-600 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                {task.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              {/* <p className="text-sm text-gray-500">
                {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
              </p> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              {/* <p className="text-sm text-gray-500">
                {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'Unknown'}
              </p> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Close
          </button>
          <button
            onClick={() => setIsEditMode(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
}