import { useMemo } from 'react';
import { useFirebaseTasks } from './useFirebaseTasks';

export function useTaskCanvas() {
  const { tasks, loading, error } = useFirebaseTasks();

  const organizedTasks = useMemo(() => {
    const outstanding = tasks.filter(task => 
      task.status === 'in-progress' || task.status === 'pending'
    );
    
    const completed = tasks.filter(task => 
      task.status === 'completed' || task.status === 'approved'
    );
    
    const now = new Date();

    const backlog = tasks.filter(task => {
    if (!task.dueDate) return false;

    const dueDate = new Date(task.dueDate);

    return (
        dueDate < now &&
        task.status !== 'completed' &&
        task.status !== 'approved'
    );
    });

    return {
      outstanding,
      completed,
      backlog
    };
  }, [tasks]);

  return {
    ...organizedTasks,
    loading,
    error,
    totalTasks: tasks.length
  };
}