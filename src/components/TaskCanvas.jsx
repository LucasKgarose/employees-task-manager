import React, { useState } from "react";
import { useTaskCanvas } from "../hooks/useTaskCanvas";
import TaskCard from "./TaskCard";

export default function TaskCanvas() {
  const { outstanding, completed, backlog, loading, error } = useTaskCanvas();
  const [activeTab, setActiveTab] = useState("outstanding");

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

  const tabs = [
    {
      id: "outstanding",
      label: "Outstanding",
      count: outstanding.length,
      tasks: outstanding,
      color: "border-yellow-500 text-yellow-600",
      activeColor: "border-yellow-500 bg-yellow-50"
    },
    {
      id: "completed",
      label: "Completed",
      count: completed.length,
      tasks: completed,
      color: "border-green-500 text-green-600",
      activeColor: "border-green-500 bg-green-50"
    },
    {
      id: "backlog",
      label: "Backlog",
      count: backlog.length,
      tasks: backlog,
      color: "border-red-500 text-red-600",
      activeColor: "border-red-500 bg-red-50"
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? tab.activeColor
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTabData?.tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No {activeTabData.label.toLowerCase()} tasks</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTabData?.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}