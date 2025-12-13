import React from "react";

export default function TaskCard({ task }) {
  const getCardColor = () => {
    if (task.status === "completed" || task.status === "approved") {
      return "border-green-200 bg-green-50";
    }
    if (task.status === "pending") {
      return "border-red-200 bg-red-50";
    }
    return "border-yellow-200 bg-yellow-50"; // in-progress and others
  };

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
    <div className={`rounded-lg border-2 p-4 shadow-sm transition hover:shadow-md ${getCardColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-800 truncate">{task.title}</h3>
        <div className="flex items-center gap-1 ml-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-3 w-1 rounded-sm ${
                level <= (task.priority || 3) ? getPriorityColor() : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>

      {/* Details */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Due:</span>
          <span className="font-medium">{task.dueDate}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Assignee:</span>
          <span className="font-medium">{task.assignee?.name || task.assignee}</span>
        </div>
        {task.estimateHours && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Estimate:</span>
            <span className="font-medium">{task.estimateHours}h</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-3 flex justify-between items-center">
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor()}`}>
          {task.status}
        </span>
        {task.notes && (
          <div className="text-xs text-gray-500" title={task.notes}>
            📝
          </div>
        )}
      </div>
    </div>
  );
}