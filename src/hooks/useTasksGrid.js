import { useState, useEffect } from 'react';
import { useFirebaseTasks } from '../hooks/useFirebaseTasks';

export function useTasksGrid(filter = null) {
  const { tasks, loading, error, getTasksByField } = useFirebaseTasks();
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    if (!filter) {
      setFilteredTasks(tasks);
    } else {
      // filter: { field: 'assignee', value: 'userId' }
      getTasksByField(filter.field, filter.value).then(setFilteredTasks);
    }
  }, [tasks, filter, getTasksByField]);

  return { tasks: filteredTasks, loading, error };
}
