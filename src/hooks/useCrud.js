import { useState } from 'react';

// Generic CRUD hook for tasks
export function useTasks(initialTasks = []) {
  const [tasks, setTasks] = useState(initialTasks);

  // Create
  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now().toString() }]);
  };

  // Read
  const getTask = (id) => tasks.find((t) => t.id === id);
  const getAllTasks = () => tasks;

  // Update
  const updateTask = (id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Delete
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tasks,
    addTask,
    getTask,
    getAllTasks,
    updateTask,
    deleteTask,
    setTasks, // expose for bulk operations
  };
}

// Generic CRUD hook for users
export function useUsers(initialUsers = []) {
  const [users, setUsers] = useState(initialUsers);

  const addUser = (user) => {
    setUsers((prev) => [...prev, { ...user, id: Date.now().toString() }]);
  };
  const getUser = (id) => users.find((u) => u.id === id);
  const getAllUsers = () => users;
  const updateUser = (id, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };
  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return {
    users,
    addUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    setUsers,
  };
}

// Generic CRUD hook for timesheets
export function useTimesheets(initialTimesheets = []) {
  const [timesheets, setTimesheets] = useState(initialTimesheets);

  const addTimesheet = (timesheet) => {
    setTimesheets((prev) => [...prev, { ...timesheet, id: Date.now().toString() }]);
  };
  const getTimesheet = (id) => timesheets.find((t) => t.id === id);
  const getAllTimesheets = () => timesheets;
  const updateTimesheet = (id, updates) => {
    setTimesheets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };
  const deleteTimesheet = (id) => {
    setTimesheets((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    timesheets,
    addTimesheet,
    getTimesheet,
    getAllTimesheets,
    updateTimesheet,
    deleteTimesheet,
    setTimesheets,
  };
}
