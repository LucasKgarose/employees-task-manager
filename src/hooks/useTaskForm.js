import { useState } from 'react';
import { useFirebaseTasks } from '../hooks/useFirebaseTasks';

export function useTaskForm(initialTask = null) {
  const { addTask, updateTask } = useFirebaseTasks();
  const [form, setForm] = useState(
    initialTask || {
      title: '',
      description: '',
      dueDate: '',
      status: 'pending',
      assignee: '',
      reviewer: '',
      estimateHours: '',
      actualHours: '',
      notes: '',
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      if (form.id) {
        await updateTask(form.id, { ...form, updatedAt: now });
      } else {
        await addTask({ ...form, createdAt: now, updatedAt: now });
      }
      setForm(initialTask || {
        title: '', description: '', dueDate: '', status: 'pending', assignee: '', reviewer: '', estimateHours: '', actualHours: '', notes: '',
      });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    handleChange,
    handleSubmit,
    submitting,
    error,
    setForm,
  };
}
