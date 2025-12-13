
import React, { useState, useMemo } from "react";
import { useTasksGrid } from "../hooks/useTasksGrid";
import { useTaskView } from "../hooks/useTaskView";
import TasksFilter from "./TasksFilter";
import TaskView from "./TaskView";
import TaskEditForm from "./TaskEditForm";


export default function TasksGrid({ filter }) {
  const { tasks, loading, error } = useTasksGrid(filter);
  const { selectedTask, isViewOpen, openTaskView, closeTaskView } = useTaskView();
  const [filters, setFilters] = useState({ search: "", priority: "", status: "" });
  const [editTask, setEditTask] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Local filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchMatch = !filters.search || 
        (task.title || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (task.assignee?.name || task.assignee || "").toLowerCase().includes(filters.search.toLowerCase());
      const priorityMatch = !filters.priority || String(task.priority || 3) === String(filters.priority);
      const statusMatch = !filters.status || String(task.status) === String(filters.status);
      return searchMatch && priorityMatch && statusMatch;
    });
  }, [tasks, filters]);

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
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Filter */}
      <TasksFilter filters={filters} onChange={setFilters} />

      {/* Table wrapper for horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              {[
                "Title",
                // 'Description',
                "Due Date",
                "Status",
                "Assignee",
                // 'Reviewer',
                "Priority",
                "Estimate (hrs)",
                // 'Actual (hrs)',
                // 'Notes',
                "Actions",
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
            {filteredTasks.map((task, index) => (
              <tr
                key={task.id}
                className={`transition hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {task.title}
                </td>

                {/* <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                                {task.description}
                            </td> */}

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.dueDate}
                </td>

                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : task.status === "approved"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.assignee?.name || task.assignee}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const isActive = level <= (task.priority || 3);

                      const color =
                        level <= 2
                          ? "bg-green-500"
                          : level === 3
                          ? "bg-yellow-500"
                          : level === 4
                          ? "bg-orange-500"
                          : "bg-red-500";

                      return (
                        <div
                          key={level}
                          className={`h-4 w-1.5 rounded-sm transition ${
                            isActive ? color : "bg-gray-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                </td>

                {/* <td className="px-4 py-3 text-sm text-gray-600">
                                {task.reviewer?.name || task.reviewer || '—'}
                            </td> */}

                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.estimateHours}
                </td>

                {/* <td className="px-4 py-3 text-sm text-gray-600">
                                {task.actualHours ?? '—'}
                            </td> */}

                {/* <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                                {task.notes || '—'}
                            </td> */}

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTaskView(task)}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50"
                      title="View"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setEditTask(task);
                        setIsEditOpen(true);
                      }}
                      className="rounded p-1 text-gray-600 hover:bg-gray-100"
                      title="Edit"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        /* Handle toggle disable */
                      }}
                      className={`rounded p-1 ${
                        task.disabled
                          ? "text-green-600 hover:bg-green-50"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                      title={task.disabled ? "Enable" : "Disable"}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTasks.length === 0 && (
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
      
      {/* Task View Modal */}
      <TaskView 
        task={selectedTask} 
        isOpen={isViewOpen} 
        onClose={closeTaskView} 
      />
      
      {/* Task Edit Modal */}
      <TaskEditForm 
        task={editTask} 
        isOpen={isEditOpen} 
        onClose={() => {
          setIsEditOpen(false);
          setEditTask(null);
        }}
        onSuccess={() => {
          setIsEditOpen(false);
          setEditTask(null);
        }}
      />
      
      {/* Task Create Modal */}
      <TaskEditForm 
        task={null} 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
