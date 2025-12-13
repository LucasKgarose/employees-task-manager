import { useState } from 'react';

export function useTaskView() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const openTaskView = (task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const closeTaskView = () => {
    setSelectedTask(null);
    setIsViewOpen(false);
  };

  return {
    selectedTask,
    isViewOpen,
    openTaskView,
    closeTaskView,
  };
}